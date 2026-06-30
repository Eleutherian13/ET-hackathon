import os
import uuid
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from database.connection import get_db
from services.pdf_extractor import extract_full_text
from services.llm_client import call_claude_json

load_dotenv()
logger = logging.getLogger(__name__)
router = APIRouter()

UPLOADS_PATH = os.getenv("UPLOADS_PATH", "./uploads")

SUBMITTAL_EXTRACTION_SYSTEM = """You are a procurement engineer analyzing a vendor technical submittal for a data centre EPC project.
Extract all technical performance attributes from the submittal document text.

Return a JSON object where keys are snake_case attribute names and values are numeric or string values.
Do NOT include units in the key name — put them in a separate _unit field only if needed.

Common attributes to extract:
- rated_kva: rated power capacity as a number
- input_voltage_vac: input voltage as a number (VAC)
- input_frequency_hz: input frequency as a number (Hz)
- input_thdi_pct: input total harmonic distortion as a percentage number
- output_voltage_vac: output voltage as a number (VAC)
- output_frequency_hz: output frequency as a number (Hz)
- output_thdu_pct: output voltage harmonic distortion as a percentage number
- efficiency_pct: efficiency percentage at full load as a number
- transfer_time_ms: transfer time in milliseconds as a number
- battery_autonomy_min: battery backup time in minutes as a number
- ip_rating: ingress protection rating as a string (e.g. "IP31")

Return ONLY valid JSON with extracted values. No preamble. No markdown."""


def save_upload(file: UploadFile) -> str:
    os.makedirs(UPLOADS_PATH, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOADS_PATH, unique_filename)
    content = file.file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    return file_path


@router.post("/specification")
async def upload_specification(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted for specification upload")

    doc_id = str(uuid.uuid4())
    db = get_db()
    try:
        file_path = save_upload(file)
        db.execute("""
            INSERT OR REPLACE INTO documents (id, filename, doc_type, upload_ts, file_path, status, page_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (doc_id, file.filename, "specification", datetime.utcnow().isoformat(), file_path, "processing", 0))
        db.commit()

        try:
            from services.spec_parser import parse_spec_document
            extracted_clauses = parse_spec_document(doc_id, file_path)
            db.execute(
                "UPDATE documents SET status = ?, page_count = ? WHERE id = ?",
                ("ready", len(extracted_clauses), doc_id)
            )
            db.commit()
            return {
                "document_id": doc_id,
                "filename": file.filename,
                "status": "ready",
                "clauses_extracted": len(extracted_clauses)
            }
        except Exception as e:
            logger.error(f"Spec parsing failed for doc {doc_id}: {str(e)}")
            db.execute("UPDATE documents SET status = ? WHERE id = ?", ("failed", doc_id))
            db.commit()
            raise HTTPException(status_code=500, detail=f"Specification parsing failed: {str(e)}")
    finally:
        db.close()


@router.post("/submittal")
async def upload_submittal(
    file: UploadFile = File(...),
    vendor_name: str = Form(...),
    po_number: str = Form(...),
    equipment_item_id: str = Form(default="eq-ups-moda-001")
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted for submittal upload")

    doc_id = str(uuid.uuid4())
    po_id = str(uuid.uuid4())
    db = get_db()
    try:
        file_path = save_upload(file)
        db.execute("""
            INSERT OR REPLACE INTO documents (id, filename, doc_type, upload_ts, file_path, status, page_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (doc_id, file.filename, "submittal", datetime.utcnow().isoformat(), file_path, "processing", 0))
        db.commit()

        raw_text = extract_full_text(file_path)
        equipment = db.execute(
            "SELECT equipment_class FROM equipment_items WHERE id = ?", (equipment_item_id,)
        ).fetchone()
        equipment_class = dict(equipment)["equipment_class"] if equipment else "UPS"

        try:
            tech_attrs = parse_submittal_attributes(raw_text[:5000], equipment_class)
        except Exception as e:
            logger.warning(f"Attribute extraction failed, using empty dict: {str(e)}")
            tech_attrs = {}

        import json
        db.execute("""
            INSERT OR REPLACE INTO purchase_orders
            (id, po_number, vendor_name, document_id, equipment_item_id, po_date,
             technical_attributes_json, compliance_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            po_id, po_number, vendor_name, doc_id, equipment_item_id,
            datetime.utcnow().strftime("%Y-%m-%d"), json.dumps(tech_attrs), "PENDING"
        ))
        db.execute("UPDATE documents SET status = 'ready' WHERE id = ?", (doc_id,))
        db.commit()

        return {
            "po_id": po_id,
            "document_id": doc_id,
            "vendor_name": vendor_name,
            "po_number": po_number,
            "equipment_item_id": equipment_item_id,
            "attributes_extracted": len(tech_attrs),
            "status": "ready"
        }
    except Exception as e:
        logger.error(f"Submittal upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/documents")
async def get_documents():
    db = get_db()
    try:
        rows = db.execute(
            "SELECT * FROM documents ORDER BY upload_ts DESC"
        ).fetchall()
        return {"documents": [dict(r) for r in rows]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


def parse_submittal_attributes(text: str, equipment_class: str) -> dict:
    user_message = f"""Extract technical performance attributes from this vendor submittal document.
Equipment class: {equipment_class}

SUBMITTAL TEXT:
{text}"""

    return call_claude_json(SUBMITTAL_EXTRACTION_SYSTEM, user_message, max_tokens=1000)