import logging
from fastapi import APIRouter, HTTPException
from database.connection import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary():
    db = get_db()
    try:
        ncr_rows = db.execute(
            "SELECT severity, COUNT(*) as count FROM ncrs WHERE status = 'open' GROUP BY severity"
        ).fetchall()
        ncr_counts = {"CRITICAL": 0, "MAJOR": 0, "MINOR": 0}
        for row in ncr_rows:
            row = dict(row)
            ncr_counts[row["severity"]] = row["count"]

        total_docs = db.execute("SELECT COUNT(*) as c FROM documents").fetchone()["c"]
        compliance_runs = db.execute(
            "SELECT COUNT(*) as c FROM agent_runs WHERE agent_name = 'spec_compliance' AND status = 'completed'"
        ).fetchone()["c"]

        at_risk_tasks = db.execute(
            "SELECT COUNT(*) as c FROM schedule_tasks WHERE risk_score > 0.5"
        ).fetchone()["c"]

        critical_path_tasks = db.execute(
            "SELECT COUNT(*) as c FROM schedule_tasks WHERE total_float_days = 0"
        ).fetchone()["c"]

        open_rfis = db.execute(
            "SELECT COUNT(*) as c FROM rfis WHERE is_resolved = 0"
        ).fetchone()["c"]

        recent_runs = db.execute("""
            SELECT id, agent_name, trigger_event, status, started_ts,
                   completed_ts, records_processed, records_created, output_summary
            FROM agent_runs
            ORDER BY started_ts DESC
            LIMIT 5
        """).fetchall()
        recent_runs = [dict(r) for r in recent_runs]

        # Health score computation
        health_score = 100.0
        health_score -= ncr_counts["CRITICAL"] * 15.0
        health_score -= ncr_counts["MAJOR"] * 8.0
        health_score -= ncr_counts["MINOR"] * 3.0

        critical_delay_tasks = db.execute(
            "SELECT COUNT(*) as c FROM schedule_tasks WHERE total_float_days = 0 AND delay_probability > 0.7"
        ).fetchone()["c"]
        health_score -= critical_delay_tasks * 10.0
        health_score = max(0.0, min(100.0, health_score))

        pos = db.execute("SELECT * FROM purchase_orders ORDER BY po_date DESC LIMIT 5").fetchall()
        purchase_orders = [dict(p) for p in pos]

        return {
            "open_ncr_count": ncr_counts,
            "total_documents": total_docs,
            "compliance_checks_run": compliance_runs,
            "at_risk_tasks": at_risk_tasks,
            "critical_path_tasks": critical_path_tasks,
            "open_rfis": open_rfis,
            "recent_agent_runs": recent_runs,
            "project_health_score": round(health_score, 1),
            "purchase_orders": purchase_orders
        }
    except Exception as e:
        logger.error(f"Dashboard summary error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()