import json
import uuid
import math
import logging
from datetime import datetime
from typing import List, Dict

from database.connection import get_db
from services.llm_client import call_claude

logger = logging.getLogger(__name__)

MITIGATION_SYSTEM = """You are a senior project controls specialist on a Tier IV hyperscale data centre EPC project.
Generate 3 specific, actionable mitigation options for a high-risk schedule task.
Be concrete: name specific actions, responsible roles, and realistic timelines.
Reference real data centre construction steps, certifications, and vendor escalation paths."""


def run_schedule_risk_analysis() -> Dict:
    agent_run_id = str(uuid.uuid4())
    started_ts = datetime.utcnow().isoformat()
    db = get_db()

    try:
        tasks = db.execute(
            "SELECT * FROM schedule_tasks ORDER BY planned_start ASC"
        ).fetchall()
        tasks = [dict(t) for t in tasks]

        open_ncrs = db.execute("""
            SELECT n.equipment_item_id, n.severity, n.id as ncr_id, n.title
            FROM ncrs n
            WHERE n.status = 'open'
        """).fetchall()
        open_ncrs = [dict(n) for n in open_ncrs]

        equipment_ncr_map: Dict[str, List[str]] = {}
        for ncr in open_ncrs:
            eq_id = ncr.get("equipment_item_id")
            if eq_id:
                equipment_ncr_map.setdefault(eq_id, []).append(ncr["severity"])

        task_scores: Dict[str, float] = {}

        for task in tasks:
            procurement_delay = get_procurement_delay_for_task(task, equipment_ncr_map)
            pred_ids = json.loads(task.get("predecessor_ids_json", "[]"))
            predecessor_risks = [task_scores.get(pid, 0.0) for pid in pred_ids if pid in task_scores]

            risk_score = compute_task_risk_score(task, procurement_delay, predecessor_risks)
            delay_prob = compute_delay_probability(risk_score)
            task_scores[task["id"]] = risk_score

            mitigation_text = None
            if risk_score > 0.5:
                eq_id = task.get("equipment_item_id")
                severities = equipment_ncr_map.get(eq_id, []) if eq_id else []
                procurement_context = build_procurement_context(eq_id, severities, procurement_delay, db)
                try:
                    mitigation_text = generate_mitigation(task, risk_score, delay_prob, procurement_context)
                except Exception as e:
                    logger.error(f"Mitigation generation failed for task {task['id']}: {str(e)}")
                    mitigation_text = f"Manual review required. Risk score: {risk_score:.0%}. Check equipment procurement status and vendor NCR resolution."

            db.execute("""
                UPDATE schedule_tasks
                SET risk_score = ?, delay_probability = ?, mitigation_text = ?, risk_checked_ts = ?
                WHERE id = ?
            """, (
                round(risk_score, 4),
                round(delay_prob, 4),
                mitigation_text,
                datetime.utcnow().isoformat(),
                task["id"]
            ))

        db.commit()

        at_risk = [t for t in tasks if task_scores.get(t["id"], 0) > 0.5]
        high_risk = [t for t in tasks if task_scores.get(t["id"], 0) > 0.7]

        at_risk_full = []
        for t in at_risk:
            t_copy = dict(t)
            t_copy["risk_score"] = round(task_scores.get(t["id"], 0), 4)
            t_copy["delay_probability"] = round(compute_delay_probability(task_scores.get(t["id"], 0)), 4)
            at_risk_full.append(t_copy)

        db.execute("""
            INSERT OR REPLACE INTO agent_runs
            (id, agent_name, trigger_event, input_summary, output_summary,
             status, started_ts, completed_ts, records_processed, records_created)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            agent_run_id, "schedule_risk", "schedule_risk_analysis",
            f"{len(tasks)} tasks analyzed, {len(open_ncrs)} open NCRs",
            f"{len(at_risk)} at-risk tasks (risk>0.5), {len(high_risk)} high-risk (risk>0.7)",
            "completed", started_ts, datetime.utcnow().isoformat(),
            len(tasks), len(at_risk)
        ))
        db.commit()

        return {
            "tasks_analyzed": len(tasks),
            "high_risk_count": len(high_risk),
            "at_risk_tasks": at_risk_full,
            "agent_run_id": agent_run_id,
            "completed_ts": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Schedule risk analysis failed: {str(e)}")
        try:
            db.execute("""
                INSERT OR REPLACE INTO agent_runs
                (id, agent_name, trigger_event, status, started_ts, completed_ts, error_text)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                agent_run_id, "schedule_risk", "schedule_risk_analysis",
                "failed", started_ts, datetime.utcnow().isoformat(), str(e)
            ))
            db.commit()
        except Exception:
            pass
        raise
    finally:
        db.close()


def compute_task_risk_score(task: Dict, procurement_delay_days: float, predecessor_risks: List[float]) -> float:
    float_days = task.get("total_float_days", 0)
    original_float = task.get("original_float_days", float_days)

    # Float consumption factor [0, 1]
    if float_days == 0:
        float_factor = 1.0
    elif float_days == 1:
        float_factor = 0.70
    elif float_days <= 3:
        float_factor = 0.45
    elif float_days <= 7:
        float_factor = 0.25
    else:
        float_factor = max(0.0, 1.0 - (float_days / max(original_float, float_days, 1)) * 0.5)

    # Procurement risk factor [0, 1]
    if procurement_delay_days >= 14:
        procurement_risk = 0.90
    elif procurement_delay_days >= 7:
        procurement_risk = 0.60
    elif procurement_delay_days >= 2:
        procurement_risk = 0.30
    else:
        procurement_risk = 0.0

    # Predecessor risk factor [0, 1]
    if predecessor_risks:
        predecessor_risk = sum(predecessor_risks) / len(predecessor_risks)
    else:
        predecessor_risk = 0.0

    # Resource risk — fixed default (no live resource data available)
    resource_risk = 0.30

    # Weather risk — fixed default (no live weather integration in hackathon)
    weather_risk = 0.10

    risk_score = (
        0.30 * float_factor
        + 0.35 * procurement_risk
        + 0.20 * predecessor_risk
        + 0.10 * resource_risk
        + 0.05 * weather_risk
    )

    return min(1.0, max(0.0, risk_score))


def compute_delay_probability(risk_score: float) -> float:
    k = 7.0
    theta = 0.45
    probability = 1.0 / (1.0 + math.exp(-k * (risk_score - theta)))
    return round(probability, 4)


def get_procurement_delay_for_task(task: Dict, equipment_ncr_map: Dict) -> float:
    eq_id = task.get("equipment_item_id")
    if not eq_id:
        return 0.0
    severities = equipment_ncr_map.get(eq_id, [])
    if not severities:
        return 0.0
    delay_days = 0.0
    for sev in severities:
        if sev == "CRITICAL":
            delay_days = max(delay_days, 14.0)
        elif sev == "MAJOR":
            delay_days = max(delay_days, 7.0)
        elif sev == "MINOR":
            delay_days = max(delay_days, 2.0)
    return delay_days


def build_procurement_context(equipment_item_id: Optional[str], severities: List[str],
                               delay_days: float, db) -> str:
    if not equipment_item_id:
        return "No equipment linked to this task."

    ncr_rows = db.execute("""
        SELECT n.title, n.severity, n.status, d.attribute_name,
               d.specified_value, d.submitted_value
        FROM ncrs n
        JOIN deviations d ON n.deviation_id = d.id
        WHERE n.equipment_item_id = ? AND n.status = 'open'
    """, (equipment_item_id,)).fetchall()

    if not ncr_rows:
        return f"Equipment {equipment_item_id}: No open NCRs. Estimated procurement delay: {delay_days:.0f} days."

    context_lines = [f"Equipment: {equipment_item_id}"]
    context_lines.append(f"Estimated procurement delay: {delay_days:.0f} days")
    context_lines.append(f"Open NCRs ({len(ncr_rows)}):")
    for row in ncr_rows:
        row = dict(row)
        context_lines.append(
            f"  - [{row['severity']}] {row['title']}: "
            f"{row['attribute_name']} submitted {row['submitted_value']} "
            f"vs required {row['specified_value']}"
        )
    return "\n".join(context_lines)


def generate_mitigation(task: Dict, risk_score: float, delay_prob: float, procurement_context: str) -> str:
    pred_ids = json.loads(task.get("predecessor_ids_json", "[]"))
    pred_str = ", ".join(pred_ids) if pred_ids else "None"

    user_message = f"""Generate 3 specific mitigation options for this at-risk schedule task.

TASK DETAILS:
Task ID: {task['id']}
Task Code: {task.get('task_code', task['id'])}
Description: {task['description']}
Planned dates: {task['planned_start']} to {task['planned_finish']}
Float remaining: {task['total_float_days']} days
Risk score: {risk_score:.0%}
Delay probability: {delay_prob:.0%}
Predecessor tasks: {pred_str}

PROCUREMENT CONTEXT:
{procurement_context}

Format each option exactly as:
OPTION 1: [title]
Actions:
- [specific action 1]
- [specific action 2]
- [specific action 3]
Days saved: X-Y days
Cost impact: Low/Medium/High
Owner: [responsible role]

OPTION 2: [title]
...

OPTION 3: [title]
..."""

    return call_claude(MITIGATION_SYSTEM, user_message, max_tokens=1000)