import json
import uuid
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional

from database.connection import get_db
from services.llm_client import call_claude_json, call_claude

logger = logging.getLogger(__name__)

SEVERITY_SYSTEM = """You are a quality assurance engineer on a Tier IV data centre EPC project.
Classify the severity of this specification deviation and provide a conformance weight score.

Severity definitions:
- CRITICAL: Prevents Tier IV certification, violates a mandatory safety standard, or requires complete equipment replacement. No waiver possible from certifier.
- MAJOR: Materially non-compliant. 15-25% below minimum threshold, potentially waivable with documented client and certifier approval. Vendor can revise.
- MINOR: Below specification but limited certification impact. Waivable with site environment assessment or documented client acceptance.
- OBSERVATION: Borderline, worth documenting, no immediate action required.

w_conform is a conformance weight between 0.0 and 1.0:
- 1.0 = fully compliant
- 0.75-0.95 = CRITICAL range (serious but equipment may be partially functional)
- 0.55-0.74 = MAJOR range
- 0.15-0.54 = MINOR range
- 0.0-0.14 = OBSERVATION

Return ONLY valid JSON with no preamble and no markdown fences:
{
  "severity": "CRITICAL|MAJOR|MINOR|OBSERVATION",
  "justification": "2-3 sentence technical justification referencing standards",
  "recommended_action": "specific actionable resolution step",
  "w_conform": <float 0.0-1.0>
}"""


def run_compliance_check(po_id: str) -> Dict:
    agent_run_id = str(uuid.uuid4())
    started_ts = datetime.utcnow().isoformat()
    db = get_db()

    try:
        po = db.execute("SELECT * FROM purchase_orders WHERE id = ?", (po_id,)).fetchone()
        if not po:
            raise ValueError(f"Purchase order {po_id} not found")
        po = dict(po)
        po_attrs = json.loads(po.get("technical_attributes_json", "{}"))

        equipment = db.execute(
            "SELECT * FROM equipment_items WHERE id = ?", (po.get("equipment_item_id"),)
        ).fetchone()
        if not equipment:
            raise ValueError(f"Equipment item not found for PO {po_id}")
        equipment = dict(equipment)
        equipment_class = equipment.get("equipment_class", "UPS")
        spec_clause_ids = json.loads(equipment.get("spec_clause_ids_json", "[]"))

        if spec_clause_ids:
            placeholders = ",".join(["?" for _ in spec_clause_ids])
            clauses = db.execute(
                f"SELECT * FROM spec_clauses WHERE id IN ({placeholders})", spec_clause_ids
            ).fetchall()
        else:
            clauses = db.execute(
                "SELECT * FROM spec_clauses WHERE equipment_class = ?", (equipment_class,)
            ).fetchall()

        clauses = [dict(c) for c in clauses]

        all_requirements = []
        for clause in clauses:
            reqs = json.loads(clause.get("requirements_json", "[]"))
            for req in reqs:
                req["spec_clause_id"] = clause["id"]
                req["clause_number"] = clause.get("clause_number", "")
                req["clause_title"] = clause.get("clause_title", "")
                req["tier"] = clause.get("tier", "TIER_IV")
            all_requirements.extend(reqs)

        raw_deviations = compare_attributes(po_attrs, all_requirements, equipment_class)

        scored_deviations = []
        for dev in raw_deviations:
            matching_clause = next(
                (c for c in clauses if c["id"] == dev.get("spec_clause_id")),
                clauses[0] if clauses else {}
            )
            scored = score_deviation(dev, equipment_class, matching_clause.get("tier", "TIER_IV"))
            scored["spec_clause"] = matching_clause
            scored_deviations.append(scored)

        deviation_ids = []
        ncr_ids = []

        for dev in scored_deviations:
            dev_id = str(uuid.uuid4())
            deviation_ids.append(dev_id)
            dev["id"] = dev_id

            db.execute("""
                INSERT OR REPLACE INTO deviations
                (id, po_id, spec_clause_id, attribute_name, specified_value,
                 submitted_value, deviation_pct, severity, deviation_type,
                 w_conform, detected_ts)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                dev_id, po_id, dev.get("spec_clause_id"), dev["attribute_name"],
                dev["specified_value"], dev["submitted_value"],
                dev.get("deviation_pct"), dev["severity"],
                dev.get("deviation_type", "VALUE"), dev.get("w_conform", 0.5),
                datetime.utcnow().isoformat()
            ))

            if dev["severity"] in ("CRITICAL", "MAJOR", "MINOR"):
                ncr_id = generate_ncr(dev, po_id, equipment.get("id", ""), dev.get("spec_clause", {}))
                ncr_ids.append(ncr_id)
                dev["ncr_id"] = ncr_id

        db.commit()

        compliance_status = "COMPLIANT"
        if any(d["severity"] == "CRITICAL" for d in scored_deviations):
            compliance_status = "CRITICAL_NON_CONFORMANCE"
        elif any(d["severity"] == "MAJOR" for d in scored_deviations):
            compliance_status = "NON_CONFORMANT"
        elif any(d["severity"] == "MINOR" for d in scored_deviations):
            compliance_status = "MINOR_NON_CONFORMANCE"

        db.execute("""
            UPDATE purchase_orders
            SET compliance_status = ?, deviation_count = ?, checked_ts = ?
            WHERE id = ?
        """, (compliance_status, len(scored_deviations), datetime.utcnow().isoformat(), po_id))
        db.commit()

        result_summary = {
            "total_deviations": len(scored_deviations),
            "critical": sum(1 for d in scored_deviations if d["severity"] == "CRITICAL"),
            "major": sum(1 for d in scored_deviations if d["severity"] == "MAJOR"),
            "minor": sum(1 for d in scored_deviations if d["severity"] == "MINOR"),
        }

        db.execute("""
            INSERT OR REPLACE INTO agent_runs
            (id, agent_name, trigger_event, input_summary, output_summary,
             status, started_ts, completed_ts, records_processed, records_created)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            agent_run_id, "spec_compliance", f"compliance_check:po:{po_id}",
            f"PO {po_id} | {len(all_requirements)} requirements | {len(clauses)} clauses | vendor: {po.get('vendor_name', '')}",
            f"{result_summary['total_deviations']} deviations: {result_summary['critical']} CRITICAL, {result_summary['major']} MAJOR, {result_summary['minor']} MINOR",
            "completed", started_ts, datetime.utcnow().isoformat(),
            len(all_requirements), len(scored_deviations) + len(ncr_ids)
        ))
        db.commit()

        return {
            "po_id": po_id,
            "compliance_status": compliance_status,
            "deviations": scored_deviations,
            "ncr_ids": ncr_ids,
            "summary": result_summary,
            "agent_run_id": agent_run_id
        }

    except Exception as e:
        logger.error(f"Compliance check failed for PO {po_id}: {str(e)}")
        try:
            db.execute("""
                INSERT OR REPLACE INTO agent_runs
                (id, agent_name, trigger_event, status, started_ts, completed_ts, error_text)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                agent_run_id, "spec_compliance", f"compliance_check:po:{po_id}",
                "failed", started_ts, datetime.utcnow().isoformat(), str(e)
            ))
            db.commit()
        except Exception:
            pass
        raise
    finally:
        db.close()


def compare_attributes(po_attrs: Dict, spec_requirements: List, equipment_class: str) -> List[Dict]:
    matching_rules = {
        "UPS": {
            "input_voltage_vac": 10.0,
            "input_frequency_hz": 5.0,
            "output_voltage_vac": 1.0,
            "output_frequency_hz": 0.1,
        },
        "CRAC": {
            "cooling_capacity_kw": 5.0,
            "supply_air_temp_c": 2.0,
        },
        "GENERATOR": {
            "rated_power_kva": 5.0,
            "output_voltage_vac": 2.5,
        }
    }
    equipment_rules = matching_rules.get(equipment_class, {})
    deviations = []

    for req in spec_requirements:
        attr = req.get("attribute")
        if not attr:
            continue

        if attr not in po_attrs:
            deviations.append({
                "attribute_name": attr,
                "specified_value": str(req.get("required_value", "N/A")),
                "submitted_value": "NOT PROVIDED",
                "deviation_pct": None,
                "deviation_type": "MISSING",
                "spec_clause_id": req.get("spec_clause_id"),
                "unit": req.get("unit", ""),
                "clause_number": req.get("clause_number", ""),
                "clause_title": req.get("clause_title", ""),
                "tier": req.get("tier", "TIER_IV")
            })
            continue

        submitted_val = po_attrs[attr]
        required_val = req.get("required_value")
        tolerance_type = req.get("tolerance_type", "EXACT")
        tolerance_pct = req.get("tolerance_pct") or equipment_rules.get(attr, 0)

        is_deviant = False
        deviation_pct = None

        if isinstance(required_val, str) or isinstance(submitted_val, str):
            if str(submitted_val).strip().upper() != str(required_val).strip().upper():
                is_deviant = True
        else:
            try:
                sub_num = float(submitted_val)
                req_num = float(required_val)

                if tolerance_type == "MIN":
                    is_deviant = sub_num < req_num
                    if is_deviant and req_num != 0:
                        deviation_pct = round((req_num - sub_num) / req_num * 100, 2)
                elif tolerance_type == "MAX":
                    is_deviant = sub_num > req_num
                    if is_deviant and req_num != 0:
                        deviation_pct = round((sub_num - req_num) / req_num * 100, 2)
                elif tolerance_type == "EXACT":
                    if tolerance_pct and float(tolerance_pct) > 0:
                        lower = req_num * (1 - float(tolerance_pct) / 100)
                        upper = req_num * (1 + float(tolerance_pct) / 100)
                        is_deviant = sub_num < lower or sub_num > upper
                        if is_deviant and req_num != 0:
                            deviation_pct = round(abs(sub_num - req_num) / req_num * 100, 2)
                    else:
                        is_deviant = abs(sub_num - req_num) > 0.001
                        if is_deviant and req_num != 0:
                            deviation_pct = round(abs(sub_num - req_num) / req_num * 100, 2)
            except (ValueError, TypeError):
                if str(submitted_val) != str(required_val):
                    is_deviant = True

        if is_deviant:
            deviations.append({
                "attribute_name": attr,
                "specified_value": str(required_val),
                "submitted_value": str(submitted_val),
                "deviation_pct": deviation_pct,
                "deviation_type": tolerance_type,
                "spec_clause_id": req.get("spec_clause_id"),
                "unit": req.get("unit", ""),
                "clause_number": req.get("clause_number", ""),
                "clause_title": req.get("clause_title", ""),
                "tier": req.get("tier", "TIER_IV")
            })

    return deviations


def score_deviation(deviation: Dict, equipment_class: str, tier: str) -> Dict:
    attr = deviation["attribute_name"]
    specified = deviation["specified_value"]
    submitted = deviation["submitted_value"]
    dev_pct = deviation.get("deviation_pct")
    deviation_type = deviation.get("deviation_type", "VALUE")
    clause_ref = f"{deviation.get('clause_number', '')} — {deviation.get('clause_title', '')}"

    user_message = f"""DEVIATION DETAILS:
Attribute: {attr}
Specified value: {specified} {deviation.get('unit', '')}
Submitted value: {submitted} {deviation.get('unit', '')}
Deviation magnitude: {f'{dev_pct:.1f}%' if dev_pct else 'N/A (string/type mismatch)'}
Deviation type: {deviation_type}
Equipment class: {equipment_class}
Tier applicability: {tier}
Clause reference: {clause_ref}

Classify this deviation severity and provide the conformance weight score."""

    try:
        result = call_claude_json(SEVERITY_SYSTEM, user_message, max_tokens=600)
        deviation["severity"] = result.get("severity", "MINOR")
        deviation["justification"] = result.get("justification", "")
        deviation["recommended_action"] = result.get("recommended_action", "Review and resolve with vendor")
        deviation["w_conform"] = float(result.get("w_conform", 0.5))
    except Exception as e:
        logger.error(f"Severity scoring failed for {attr}: {str(e)}")
        # Fallback heuristic scoring
        if dev_pct and dev_pct > 15:
            deviation["severity"] = "CRITICAL"
            deviation["w_conform"] = 0.88
        elif dev_pct and dev_pct > 10:
            deviation["severity"] = "MAJOR"
            deviation["w_conform"] = 0.65
        elif dev_pct:
            deviation["severity"] = "MINOR"
            deviation["w_conform"] = 0.30
        else:
            deviation["severity"] = "MINOR"
            deviation["w_conform"] = 0.25
        deviation["justification"] = f"Automated classification: {attr} is {submitted} vs required {specified}"
        deviation["recommended_action"] = f"Issue formal NCR. Request vendor provide compliant {attr} value."

    return deviation


def generate_ncr(deviation: Dict, po_id: str, equipment_item_id: str, spec_clause: Dict) -> str:
    ncr_id = str(uuid.uuid4())
    attr_display = deviation["attribute_name"].replace("_", " ").title()

    ncr_system = """You are a quality assurance engineer on a Tier IV data centre EPC project.
Generate a professional Non-Conformance Report entry. Be precise and actionable.
Write for a project manager who must resolve this with the vendor within 5 business days."""

    ncr_user = f"""Generate an NCR for this specification deviation:

ATTRIBUTE: {deviation['attribute_name']}
SPECIFIED: {deviation['specified_value']} {deviation.get('unit', '')}
SUBMITTED: {deviation['submitted_value']} {deviation.get('unit', '')}
DEVIATION: {f"{deviation.get('deviation_pct', 0):.1f}% below specification" if deviation.get('deviation_pct') else "Non-conformant value"}
SEVERITY: {deviation['severity']}
EQUIPMENT CLASS: {spec_clause.get('equipment_class', 'UPS')}
SPEC CLAUSE: {spec_clause.get('clause_number', '')} — {spec_clause.get('clause_title', '')}
TIER: {spec_clause.get('tier', 'TIER_IV')}
JUSTIFICATION: {deviation.get('justification', '')}

Write in this exact format:
TITLE: [concise NCR title, max 80 chars]
DESCRIPTION: [2-3 sentences describing what was submitted vs what was required]
IMPACT: [1-2 sentences on certification or performance impact]
ACTIONS:
1. [action with responsible party and deadline]
2. [action with responsible party and deadline]
3. [action with responsible party and deadline]"""

    try:
        response_text = call_claude(ncr_system, ncr_user, max_tokens=800)
    except Exception as e:
        logger.error(f"NCR generation LLM call failed: {str(e)}")
        response_text = f"TITLE: {attr_display} Non-Conformance — {deviation['severity']}\nDESCRIPTION: Vendor submitted {deviation['submitted_value']} for {deviation['attribute_name']} against specified requirement of {deviation['specified_value']}.\nIMPACT: Requires resolution before equipment acceptance.\nACTIONS:\n1. Issue formal rejection to vendor within 24 hours\n2. Request revised submittal within 5 business days\n3. Notify project manager and schedule coordinator"

    lines = response_text.strip().split("\n")
    title = f"{attr_display} Non-Conformance — {deviation['severity']}"
    description = response_text
    actions = []

    for line in lines:
        stripped = line.strip()
        if stripped.lower().startswith("title:"):
            candidate = stripped[6:].strip()
            if candidate:
                title = candidate[:200]

    in_actions = False
    for line in lines:
        stripped = line.strip()
        if stripped.lower().startswith("actions:"):
            in_actions = True
            continue
        if in_actions and stripped and stripped[0].isdigit() and "." in stripped[:3]:
            action_text = re.sub(r"^\d+\.\s*", "", stripped).strip()
            if action_text:
                actions.append(action_text)

    if not actions:
        actions = [
            f"Issue formal NCR rejection to vendor for {deviation['attribute_name']} within 24 hours",
            "Request revised technical submittal confirming compliant value within 5 business days",
            "Notify project manager and schedule coordinator of potential procurement impact"
        ]

    schedule_impact = _compute_schedule_impact(equipment_item_id)
    due_date = (datetime.utcnow() + timedelta(days=5)).strftime("%Y-%m-%d")

    db = get_db()
    try:
        db.execute("""
            INSERT OR REPLACE INTO ncrs
            (id, deviation_id, po_id, equipment_item_id, title, description,
             severity, status, raised_ts, due_date, assigned_to,
             spec_clause_ref, page_ref, schedule_impact_json, actions_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ncr_id,
            deviation["id"],
            po_id,
            equipment_item_id,
            title,
            description,
            deviation["severity"],
            "open",
            datetime.utcnow().isoformat(),
            due_date,
            "Quality Manager",
            f"{spec_clause.get('clause_number', '')} — {spec_clause.get('clause_title', '')}",
            spec_clause.get("page_refs_json", "[]"),
            json.dumps(schedule_impact),
            json.dumps(actions)
        ))
        db.commit()
    finally:
        db.close()

    return ncr_id


def _compute_schedule_impact(equipment_item_id: str) -> Dict:
    if not equipment_item_id:
        return {"linked_task_ids": [], "min_float_days": None, "days_until_required": None, "risk_level": "LOW", "tasks": []}

    db = get_db()
    try:
        tasks = db.execute("""
            SELECT id, task_code, description, planned_start, planned_finish,
                   total_float_days, risk_score
            FROM schedule_tasks
            WHERE equipment_item_id = ?
            ORDER BY planned_start ASC
        """, (equipment_item_id,)).fetchall()

        if not tasks:
            return {"linked_task_ids": [], "min_float_days": None, "days_until_required": None, "risk_level": "LOW", "tasks": []}

        task_dicts = [dict(t) for t in tasks]
        linked_ids = [t["id"] for t in task_dicts]
        min_float = min(t["total_float_days"] for t in task_dicts)

        earliest_start = min(t["planned_start"] for t in task_dicts)
        try:
            start_date = datetime.strptime(earliest_start, "%Y-%m-%d")
            days_until = (start_date - datetime.utcnow()).days
        except Exception:
            days_until = None

        if min_float == 0:
            risk_level = "CRITICAL"
        elif min_float <= 3:
            risk_level = "HIGH"
        elif min_float <= 7:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "linked_task_ids": linked_ids,
            "min_float_days": min_float,
            "days_until_required": days_until,
            "risk_level": risk_level,
            "tasks": [
                {
                    "id": t["id"],
                    "code": t.get("task_code", t["id"]),
                    "description": t["description"],
                    "float_days": t["total_float_days"]
                }
                for t in task_dicts[:5]
            ]
        }
    finally:
        db.close()