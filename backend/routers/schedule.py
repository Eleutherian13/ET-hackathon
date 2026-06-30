import csv
import json
import uuid
import io
import logging
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException

from database.connection import get_db
from agents.schedule_risk_agent import run_schedule_risk_analysis

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/import")
async def import_schedule(file: UploadFile = File(...)):
    if not (file.filename.endswith(".csv") or file.filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only CSV files accepted for schedule import")

    db = get_db()
    try:
        content = await file.read()
        text = content.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        imported = 0
        zero_float_tasks = []

        for row in reader:
            task_id = row.get("task_id") or row.get("id") or str(uuid.uuid4())
            task_code = row.get("task_code") or row.get("task_id") or task_id
            description = row.get("description") or row.get("task_name") or "Unnamed task"
            planned_start = row.get("planned_start", "")
            planned_finish = row.get("planned_finish", "")
            float_days = int(row.get("total_float_days", 0))
            orig_float = int(row.get("original_float_days", float_days))
            pred_raw = row.get("predecessor_ids") or row.get("predecessor_ids_json", "")
            equipment_item_id = row.get("equipment_item_id") or None

            if pred_raw.startswith("["):
                pred_json = pred_raw
            elif pred_raw:
                preds = [p.strip() for p in pred_raw.replace(";", ",").split(",") if p.strip()]
                pred_json = json.dumps(preds)
            else:
                pred_json = "[]"

            if float_days == 0:
                zero_float_tasks.append(task_code)

            db.execute("""
                INSERT OR REPLACE INTO schedule_tasks
                (id, task_code, description, planned_start, planned_finish,
                 total_float_days, original_float_days, predecessor_ids_json,
                 equipment_item_id, percent_complete, risk_score, delay_probability)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                task_id, task_code, description, planned_start, planned_finish,
                float_days, orig_float, pred_json,
                equipment_item_id if equipment_item_id else None,
                0.0, 0.0, 0.0
            ))
            imported += 1

        db.commit()
        return {
            "tasks_imported": imported,
            "zero_float_tasks": zero_float_tasks,
            "status": "imported"
        }
    except Exception as e:
        logger.error(f"Schedule import failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.post("/analyze")
async def analyze_schedule():
    try:
        result = run_schedule_risk_analysis()
        return result
    except Exception as e:
        logger.error(f"Schedule analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tasks")
async def get_schedule_tasks():
    db = get_db()
    try:
        rows = db.execute("""
            SELECT st.*, ei.description as equipment_description, ei.equipment_class
            FROM schedule_tasks st
            LEFT JOIN equipment_items ei ON st.equipment_item_id = ei.id
            ORDER BY st.risk_score DESC, st.planned_start ASC
        """).fetchall()
        tasks = [dict(r) for r in rows]
        return {"tasks": tasks, "total": len(tasks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/risks")
async def get_schedule_risks():
    db = get_db()
    try:
        rows = db.execute("""
            SELECT st.*, ei.description as equipment_description, ei.equipment_class
            FROM schedule_tasks st
            LEFT JOIN equipment_items ei ON st.equipment_item_id = ei.id
            WHERE st.risk_score > 0.3
            ORDER BY st.risk_score DESC
        """).fetchall()
        tasks = [dict(r) for r in rows]
        return {
            "at_risk_tasks": tasks,
            "total": len(tasks),
            "critical_path_count": sum(1 for t in tasks if t["total_float_days"] == 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()