import json
import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.connection import get_db
from agents.rfi_knowledge_agent import answer_rfi_query
from services.vector_store import index_rfi

logger = logging.getLogger(__name__)
router = APIRouter()


class RFIQueryRequest(BaseModel):
    query: str


class CreateRFIRequest(BaseModel):
    rfi_code: str
    rfi_type: str = "TECHNICAL"
    title: str
    description: str
    raised_by: str
    equipment_item_ids: list = []
    spec_clause_refs: list = []
    resolution_text: str = ""
    is_resolved: bool = False


@router.post("/query")
async def query_rfi(request: RFIQueryRequest):
    if not request.query or len(request.query.strip()) < 3:
        raise HTTPException(status_code=400, detail="Query must be at least 3 characters")
    try:
        result = answer_rfi_query(request.query.strip())
        return result
    except Exception as e:
        logger.error(f"RFI query endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rfis")
async def get_rfis():
    db = get_db()
    try:
        rows = db.execute(
            "SELECT * FROM rfis ORDER BY raised_ts DESC"
        ).fetchall()
        rfis = [dict(r) for r in rows]
        return {"rfis": rfis, "total": len(rfis)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.post("/rfis/create")
async def create_rfi(request: CreateRFIRequest):
    rfi_id = str(uuid.uuid4())
    db = get_db()
    try:
        db.execute("""
            INSERT OR REPLACE INTO rfis
            (id, rfi_code, rfi_type, title, description, raised_by, raised_ts,
             status, equipment_item_ids_json, spec_clause_refs_json,
             resolution_text, is_resolved, chroma_doc_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rfi_id, request.rfi_code, request.rfi_type, request.title,
            request.description, request.raised_by, datetime.utcnow().isoformat(),
            "resolved" if request.is_resolved else "open",
            json.dumps(request.equipment_item_ids),
            json.dumps(request.spec_clause_refs),
            request.resolution_text,
            1 if request.is_resolved else 0,
            rfi_id
        ))
        db.commit()

        index_text = f"{request.title} {request.description} {request.resolution_text}"
        index_rfi(rfi_id, index_text, {
            "rfi_id": rfi_id,
            "rfi_code": request.rfi_code,
            "title": request.title,
            "is_resolved": "true" if request.is_resolved else "false"
        })

        return {"rfi_id": rfi_id, "status": "created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()