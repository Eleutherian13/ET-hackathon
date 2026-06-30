import json
import logging
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from database.connection import get_db
from agents.spec_compliance_agent import run_compliance_check

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/run/{po_id}")
async def trigger_compliance_check(po_id: str):
    try:
        result = run_compliance_check(po_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Compliance check endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/results/{po_id}")
async def get_compliance_results(po_id: str):
    db = get_db()
    try:
        po = db.execute("SELECT * FROM purchase_orders WHERE id = ?", (po_id,)).fetchone()
        if not po:
            raise HTTPException(status_code=404, detail=f"Purchase order {po_id} not found")
        po = dict(po)

        deviations = db.execute("""
            SELECT d.*, n.id as ncr_id, n.title as ncr_title, n.status as ncr_status,
                   sc.clause_number, sc.clause_title
            FROM deviations d
            LEFT JOIN ncrs n ON n.deviation_id = d.id
            LEFT JOIN spec_clauses sc ON d.spec_clause_id = sc.id
            WHERE d.po_id = ?
            ORDER BY d.detected_ts DESC
        """, (po_id,)).fetchall()
        deviations = [dict(d) for d in deviations]

        summary = {
            "total": len(deviations),
            "critical": sum(1 for d in deviations if d["severity"] == "CRITICAL"),
            "major": sum(1 for d in deviations if d["severity"] == "MAJOR"),
            "minor": sum(1 for d in deviations if d["severity"] == "MINOR"),
        }

        return {
            "po_id": po_id,
            "po_number": po["po_number"],
            "vendor_name": po["vendor_name"],
            "compliance_status": po["compliance_status"],
            "checked_ts": po["checked_ts"],
            "deviations": deviations,
            "summary": summary
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/ncrs")
async def get_ncrs(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    equipment_class: Optional[str] = Query(None)
):
    db = get_db()
    try:
        query = """
            SELECT n.*, d.attribute_name, d.specified_value, d.submitted_value,
                   d.deviation_pct, d.w_conform,
                   ei.description as equipment_description, ei.equipment_class
            FROM ncrs n
            LEFT JOIN deviations d ON n.deviation_id = d.id
            LEFT JOIN equipment_items ei ON n.equipment_item_id = ei.id
            WHERE 1=1
        """
        params = []

        if severity:
            query += " AND n.severity = ?"
            params.append(severity.upper())
        if status:
            query += " AND n.status = ?"
            params.append(status.lower())
        if equipment_class:
            query += " AND ei.equipment_class = ?"
            params.append(equipment_class.upper())

        query += " ORDER BY CASE n.severity WHEN 'CRITICAL' THEN 1 WHEN 'MAJOR' THEN 2 WHEN 'MINOR' THEN 3 ELSE 4 END, n.raised_ts DESC"

        rows = db.execute(query, params).fetchall()
        ncrs = [dict(r) for r in rows]

        return {
            "ncrs": ncrs,
            "total": len(ncrs),
            "by_severity": {
                "CRITICAL": sum(1 for n in ncrs if n["severity"] == "CRITICAL"),
                "MAJOR": sum(1 for n in ncrs if n["severity"] == "MAJOR"),
                "MINOR": sum(1 for n in ncrs if n["severity"] == "MINOR"),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/ncr/{ncr_id}")
async def get_ncr_detail(ncr_id: str):
    db = get_db()
    try:
        row = db.execute("""
            SELECT n.*,
                   d.attribute_name, d.specified_value, d.submitted_value,
                   d.deviation_pct, d.w_conform, d.deviation_type,
                   sc.clause_number, sc.clause_title, sc.raw_text as clause_raw_text,
                   sc.page_refs_json as clause_pages,
                   po.vendor_name, po.po_number,
                   ei.description as equipment_description, ei.equipment_class
            FROM ncrs n
            LEFT JOIN deviations d ON n.deviation_id = d.id
            LEFT JOIN spec_clauses sc ON d.spec_clause_id = sc.id
            LEFT JOIN purchase_orders po ON n.po_id = po.id
            LEFT JOIN equipment_items ei ON n.equipment_item_id = ei.id
            WHERE n.id = ?
        """, (ncr_id,)).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail=f"NCR {ncr_id} not found")

        ncr = dict(row)

        # Parse JSON fields
        try:
            ncr["schedule_impact"] = json.loads(ncr.get("schedule_impact_json") or "{}")
        except Exception:
            ncr["schedule_impact"] = {}
        try:
            ncr["actions"] = json.loads(ncr.get("actions_json") or "[]")
        except Exception:
            ncr["actions"] = []

        return ncr
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()