#!/usr/bin/env python3
"""
DCPI Demo Data Seeder
Run once: python seed_data.py
Idempotent: safe to run multiple times.
"""
import json
import sys
import os

# Ensure backend root is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database.schema import init_db
from database.connection import get_db
from services.vector_store import index_rfi, index_spec_clause, get_or_create_collection

print("=" * 60)
print("DCPI Demo Data Seeder")
print("=" * 60)

# Initialize database
print("\n[1/8] Initializing database tables...")
init_db()
print("      ✓ All tables created/verified")

db = get_db()

# ── 1. Specification Document ─────────────────────────────────────────────────
print("\n[2/8] Seeding specification document...")
spec_doc_id = "doc-spec-ups-001"
db.execute("""
    INSERT OR REPLACE INTO documents
    (id, filename, doc_type, upload_ts, file_path, status, page_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
""", (
    spec_doc_id,
    "VERTEX-ELEC-SPEC-UPS-001-Rev2.pdf",
    "specification",
    "2025-03-15T09:00:00",
    "./uploads/VERTEX-ELEC-SPEC-UPS-001-Rev2.pdf",
    "ready",
    4
))
db.commit()
print(f"      ✓ Spec document: {spec_doc_id}")

# ── 2. Spec Clauses ───────────────────────────────────────────────────────────
print("\n[3/8] Seeding specification clauses...")

spec_clauses = [
    {
        "id": "sc-4-1",
        "clause_number": "4.1",
        "clause_title": "Scope and Applicable Standards",
        "equipment_class": "UPS",
        "clause_type": "REFERENCE",
        "tier": "TIER_IV",
        "raw_text": "This specification covers the supply, delivery, installation, testing, and commissioning of Online Double Conversion UPS systems for Project VERTEX Tier IV data centre. All equipment shall comply with IEC 62040-3 Class 1 and TIA-942-B Rated-4 requirements.",
        "requirements_json": json.dumps([]),
        "page_refs_json": json.dumps([1])
    },
    {
        "id": "sc-4-2-1",
        "clause_number": "4.2.1",
        "clause_title": "UPS Rated Power",
        "equipment_class": "UPS",
        "clause_type": "TECHNICAL",
        "tier": "TIER_IV",
        "raw_text": "Each UPS module shall have a rated output capacity of 1500 kVA at 0.9 power factor. The rating shall be continuous at full load without derating in ambient temperatures up to 40°C.",
        "requirements_json": json.dumps([
            {
                "attribute": "rated_kva",
                "required_value": 1500,
                "tolerance_type": "MIN",
                "tolerance_pct": None,
                "unit": "kVA",
                "mandatory": True,
                "description": "Minimum rated output capacity"
            }
        ]),
        "page_refs_json": json.dumps([1, 2])
    },
    {
        "id": "sc-4-2-2",
        "clause_number": "4.2.2",
        "clause_title": "Input Requirements",
        "equipment_class": "UPS",
        "clause_type": "TECHNICAL",
        "tier": "TIER_IV",
        "raw_text": "Input voltage: 415 VAC three-phase four-wire ±10%. Input frequency: 50 Hz ±5%. Input total harmonic distortion of current (THDi) shall not exceed 3% at full rated load per IEC 61000-3-12.",
        "requirements_json": json.dumps([
            {
                "attribute": "input_voltage_vac",
                "required_value": 415,
                "tolerance_type": "EXACT",
                "tolerance_pct": 10,
                "unit": "VAC",
                "mandatory": True,
                "description": "Nominal input voltage with ±10% tolerance"
            },
            {
                "attribute": "input_frequency_hz",
                "required_value": 50,
                "tolerance_type": "EXACT",
                "tolerance_pct": 5,
                "unit": "Hz",
                "mandatory": True,
                "description": "Nominal input frequency with ±5% tolerance"
            },
            {
                "attribute": "input_thdi_pct",
                "required_value": 3.0,
                "tolerance_type": "MAX",
                "tolerance_pct": None,
                "unit": "%",
                "mandatory": True,
                "description": "Maximum input current harmonic distortion per IEC 61000-3-12"
            }
        ]),
        "page_refs_json": json.dumps([2])
    },
    {
        "id": "sc-4-2-3",
        "clause_number": "4.2.3",
        "clause_title": "Output Requirements",
        "equipment_class": "UPS",
        "clause_type": "TECHNICAL",
        "tier": "TIER_IV",
        "raw_text": "Output voltage: 415 VAC ±1% under all load conditions 0-100%. Output frequency: 50 Hz ±0.1%. Output total harmonic distortion of voltage (THDu) shall not exceed 1% at full linear load.",
        "requirements_json": json.dumps([
            {
                "attribute": "output_voltage_vac",
                "required_value": 415,
                "tolerance_type": "EXACT",
                "tolerance_pct": 1,
                "unit": "VAC",
                "mandatory": True,
                "description": "Output voltage regulation ±1%"
            },
            {
                "attribute": "output_frequency_hz",
                "required_value": 50,
                "tolerance_type": "EXACT",
                "tolerance_pct": 0.1,
                "unit": "Hz",
                "mandatory": True,
                "description": "Output frequency regulation ±0.1%"
            },
            {
                "attribute": "output_thdu_pct",
                "required_value": 1.0,
                "tolerance_type": "MAX",
                "tolerance_pct": None,
                "unit": "%",
                "mandatory": True,
                "description": "Maximum output voltage harmonic distortion at full linear load"
            }
        ]),
        "page_refs_json": json.dumps([2])
    },
    {
        "id": "sc-4-2-4",
        "clause_number": "4.2.4",
        "clause_title": "Efficiency Requirements",
        "equipment_class": "UPS",
        "clause_type": "TECHNICAL",
        "tier": "TIER_IV",
        "raw_text": "The UPS shall achieve a minimum efficiency of 96.5% in online double-conversion (VFI) mode at 100% rated load (1500 kVA), measured at output terminals per IEC 62040-3 Class 1 with third-party test certificate. ECO mode efficiency is not applicable for Tier IV certification.",
        "requirements_json": json.dumps([
            {
                "attribute": "efficiency_pct",
                "required_value": 96.5,
                "tolerance_type": "MIN",
                "tolerance_pct": None,
                "unit": "%",
                "mandatory": True,
                "description": "Minimum efficiency at 100% load in online double-conversion mode per IEC 62040-3 Class 1. CRITICAL for Tier IV certification."
            }
        ]),
        "page_refs_json": json.dumps([2, 3])
    },
    {
        "id": "sc-4-2-5",
        "clause_number": "4.2.5",
        "clause_title": "Transfer Time",
        "equipment_class": "UPS",
        "clause_type": "TECHNICAL",
        "tier": "TIER_IV",
        "raw_text": "The UPS shall provide continuous uninterrupted supply in VFI (Online Double Conversion) mode. Transfer time to static bypass upon UPS fault shall not exceed 10 milliseconds. The system is classified VFI-SS-111 per IEC 62040-3.",
        "requirements_json": json.dumps([
            {
                "attribute": "transfer_time_ms",
                "required_value": 10,
                "tolerance_type": "MAX",
                "tolerance_pct": None,
                "unit": "ms",
                "mandatory": True,
                "description": "Maximum transfer time to static bypass on UPS fault"
            }
        ]),
        "page_refs_json": json.dumps([3])
    },
    {
        "id": "sc-4-2-6",
        "clause_number": "4.2.6",
        "clause_title": "Battery Autonomy",
        "equipment_class": "UPS",
        "clause_type": "TECHNICAL",
        "tier": "TIER_IV",
        "raw_text": "Battery autonomy at full rated load (1500 kVA, 0.9 pf) shall be a minimum of 10 minutes. Autonomy shall be demonstrated by factory discharge test witnessed by client or third-party inspector. Battery design life: minimum 10 years at 20°C ambient. This requirement is mandatory for Tier IV Operational Sustainability per Uptime Institute guidelines.",
        "requirements_json": json.dumps([
            {
                "attribute": "battery_autonomy_min",
                "required_value": 10,
                "tolerance_type": "MIN",
                "tolerance_pct": None,
                "unit": "minutes",
                "mandatory": True,
                "description": "Minimum battery autonomy at full rated load per Tier IV Operational Sustainability requirements"
            }
        ]),
        "page_refs_json": json.dumps([3])
    },
    {
        "id": "sc-4-3-1",
        "clause_number": "4.3.1",
        "clause_title": "Environmental Protection Rating",
        "equipment_class": "UPS",
        "clause_type": "TECHNICAL",
        "tier": "TIER_IV",
        "raw_text": "UPS enclosures shall have a minimum Ingress Protection rating of IP31 per IEC 60529. This provides protection against solid objects greater than 2.5mm and protection against vertically dripping water when tilted up to 15 degrees.",
        "requirements_json": json.dumps([
            {
                "attribute": "ip_rating",
                "required_value": "IP31",
                "tolerance_type": "EXACT",
                "tolerance_pct": None,
                "unit": "",
                "mandatory": True,
                "description": "Minimum ingress protection rating per IEC 60529"
            }
        ]),
        "page_refs_json": json.dumps([3, 4])
    },
    {
        "id": "sc-4-3-2",
        "clause_number": "4.3.2",
        "clause_title": "Testing Requirements",
        "equipment_class": "UPS",
        "clause_type": "TESTING",
        "tier": "TIER_IV",
        "raw_text": "The following factory acceptance tests (FAT) shall be performed and witnessed: full load efficiency test per IEC 62040-3, battery autonomy discharge test at 100% load, transfer time measurement, input harmonic measurement per IEC 61000-3-12, output voltage regulation test.",
        "requirements_json": json.dumps([]),
        "page_refs_json": json.dumps([4])
    }
]

clause_ids = []
for clause in spec_clauses:
    db.execute("""
        INSERT OR REPLACE INTO spec_clauses
        (id, document_id, clause_number, clause_title, equipment_class, clause_type,
         raw_text, requirements_json, tier, page_refs_json, extracted_ts)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        clause["id"], spec_doc_id, clause["clause_number"], clause["clause_title"],
        clause["equipment_class"], clause["clause_type"], clause["raw_text"],
        clause["requirements_json"], clause["tier"], clause["page_refs_json"],
        "2025-03-15T09:05:00"
    ))
    clause_ids.append(clause["id"])

db.commit()
print(f"      ✓ {len(spec_clauses)} spec clauses inserted")

# ── 3. Equipment Item ──────────────────────────────────────────────────────────
print("\n[4/8] Seeding equipment item...")
eq_id = "eq-ups-moda-001"
db.execute("""
    INSERT OR REPLACE INTO equipment_items
    (id, item_code, description, equipment_class, design_zone, quantity, unit,
     required_by_date, spec_clause_ids_json, criticality, compliance_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    eq_id,
    "EQ-UPS-MODA-001",
    "1500 kVA Online Double Conversion UPS — Primary Power Path A",
    "UPS",
    "UPS Room A1",
    1,
    "EA",
    "2026-07-22",
    json.dumps(clause_ids),
    "CRITICAL",
    1.0
))
db.commit()
print(f"      ✓ Equipment item: {eq_id}")

# ── 4. Vendor Submittal Document ───────────────────────────────────────────────
print("\n[5/8] Seeding vendor submittal document and purchase order...")
sub_doc_id = "doc-sub-ps1500-001"
db.execute("""
    INSERT OR REPLACE INTO documents
    (id, filename, doc_type, upload_ts, file_path, status, page_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
""", (
    sub_doc_id,
    "PowerShield_PS1500_Technical_Submittal_Rev1.pdf",
    "submittal",
    "2025-03-28T14:30:00",
    "./uploads/PowerShield_PS1500_Technical_Submittal_Rev1.pdf",
    "ready",
    3
))
db.commit()

# ── 5. Purchase Order with Three Deliberate Deviations ────────────────────────
po_id = "po-ps1500-001"
technical_attributes = {
    "rated_kva": 1500,
    "input_voltage_vac": 415,
    "input_frequency_hz": 50,
    "input_thdi_pct": 2.8,
    "output_voltage_vac": 415,
    "output_frequency_hz": 50,
    "output_thdu_pct": 0.8,
    "efficiency_pct": 95.8,       # ← CRITICAL DEVIATION: spec ≥96.5%, submitted 95.8%
    "transfer_time_ms": 8,
    "battery_autonomy_min": 8,    # ← MAJOR DEVIATION: spec ≥10 min, submitted 8 min
    "ip_rating": "IP20"           # ← MINOR DEVIATION: spec IP31, submitted IP20
}

db.execute("""
    INSERT OR REPLACE INTO purchase_orders
    (id, po_number, vendor_name, vendor_country, document_id, equipment_item_id,
     po_date, technical_attributes_json, compliance_status, deviation_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    po_id,
    "PO-VERTEX-2025-0047",
    "PowerShield Technologies Pvt. Ltd.",
    "India",
    sub_doc_id,
    eq_id,
    "2025-03-28",
    json.dumps(technical_attributes),
    "PENDING",
    0
))
db.commit()
print(f"      ✓ Submittal document: {sub_doc_id}")
print(f"      ✓ Purchase order: {po_id} (3 deliberate deviations embedded)")

# ── 6. Schedule Tasks ─────────────────────────────────────────────────────────
print("\n[6/8] Seeding schedule tasks...")

schedule_tasks = [
    {
        "id": "T-001",
        "task_code": "T-001",
        "description": "Site preparation and cable containment installation",
        "planned_start": "2026-07-01",
        "planned_finish": "2026-07-14",
        "total_float_days": 10,
        "original_float_days": 10,
        "predecessor_ids_json": json.dumps([]),
        "equipment_item_id": None
    },
    {
        "id": "T-002",
        "task_code": "T-002",
        "description": "UPS room civil works completion and inspection",
        "planned_start": "2026-07-08",
        "planned_finish": "2026-07-21",
        "total_float_days": 5,
        "original_float_days": 5,
        "predecessor_ids_json": json.dumps(["T-001"]),
        "equipment_item_id": None
    },
    {
        "id": "T-003",
        "task_code": "T-003",
        "description": "UPS equipment delivery to site — EQ-UPS-MODA-001",
        "planned_start": "2026-07-22",
        "planned_finish": "2026-07-22",
        "total_float_days": 0,
        "original_float_days": 0,
        "predecessor_ids_json": json.dumps(["T-002"]),
        "equipment_item_id": eq_id
    },
    {
        "id": "T-004",
        "task_code": "T-004",
        "description": "UPS unloading, rigging, and positioning in UPS room",
        "planned_start": "2026-07-23",
        "planned_finish": "2026-07-25",
        "total_float_days": 2,
        "original_float_days": 2,
        "predecessor_ids_json": json.dumps(["T-003"]),
        "equipment_item_id": eq_id
    },
    {
        "id": "T-005",
        "task_code": "T-005",
        "description": "UPS power cabling and cable terminations",
        "planned_start": "2026-07-26",
        "planned_finish": "2026-08-04",
        "total_float_days": 3,
        "original_float_days": 3,
        "predecessor_ids_json": json.dumps(["T-004"]),
        "equipment_item_id": eq_id
    },
    {
        "id": "T-006",
        "task_code": "T-006",
        "description": "UPS control system and monitoring wiring",
        "planned_start": "2026-08-01",
        "planned_finish": "2026-08-08",
        "total_float_days": 4,
        "original_float_days": 4,
        "predecessor_ids_json": json.dumps(["T-004"]),
        "equipment_item_id": eq_id
    },
    {
        "id": "T-007",
        "task_code": "T-007",
        "description": "UPS pre-commissioning checks and initial energisation",
        "planned_start": "2026-08-09",
        "planned_finish": "2026-08-12",
        "total_float_days": 0,
        "original_float_days": 0,
        "predecessor_ids_json": json.dumps(["T-005", "T-006"]),
        "equipment_item_id": eq_id
    },
    {
        "id": "T-008",
        "task_code": "T-008",
        "description": "Battery string installation and cell-level connection",
        "planned_start": "2026-08-10",
        "planned_finish": "2026-08-14",
        "total_float_days": 2,
        "original_float_days": 2,
        "predecessor_ids_json": json.dumps(["T-007"]),
        "equipment_item_id": eq_id
    },
    {
        "id": "T-009",
        "task_code": "T-009",
        "description": "UPS load bank testing — FAT verification on site",
        "planned_start": "2026-08-15",
        "planned_finish": "2026-08-17",
        "total_float_days": 1,
        "original_float_days": 1,
        "predecessor_ids_json": json.dumps(["T-007", "T-008"]),
        "equipment_item_id": eq_id
    },
    {
        "id": "T-010",
        "task_code": "T-010",
        "description": "Cooling system installation — parallel track",
        "planned_start": "2026-07-15",
        "planned_finish": "2026-08-05",
        "total_float_days": 8,
        "original_float_days": 8,
        "predecessor_ids_json": json.dumps(["T-001"]),
        "equipment_item_id": None
    },
    {
        "id": "T-011",
        "task_code": "T-011",
        "description": "Integrated power and cooling commissioning test",
        "planned_start": "2026-08-18",
        "planned_finish": "2026-08-25",
        "total_float_days": 1,
        "original_float_days": 1,
        "predecessor_ids_json": json.dumps(["T-009", "T-010"]),
        "equipment_item_id": eq_id
    },
    {
        "id": "T-012",
        "task_code": "T-012",
        "description": "Tier IV witness test and project handover — CONTRACTUAL DEADLINE",
        "planned_start": "2026-08-26",
        "planned_finish": "2026-08-28",
        "total_float_days": 0,
        "original_float_days": 0,
        "predecessor_ids_json": json.dumps(["T-011"]),
        "equipment_item_id": eq_id
    }
]

for task in schedule_tasks:
    db.execute("""
        INSERT OR REPLACE INTO schedule_tasks
        (id, task_code, description, planned_start, planned_finish,
         total_float_days, original_float_days, predecessor_ids_json,
         equipment_item_id, percent_complete, risk_score, delay_probability)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        task["id"], task["task_code"], task["description"],
        task["planned_start"], task["planned_finish"],
        task["total_float_days"], task["original_float_days"],
        task["predecessor_ids_json"], task.get("equipment_item_id"),
        0.0, 0.0, 0.0
    ))

db.commit()
zero_float = [t["task_code"] for t in schedule_tasks if t["total_float_days"] == 0]
print(f"      ✓ {len(schedule_tasks)} schedule tasks inserted")
print(f"      ✓ Zero-float tasks (critical path): {zero_float}")

# ── 7. RFI Records + ChromaDB indexing ────────────────────────────────────────
print("\n[7/8] Seeding RFIs and indexing in ChromaDB...")

rfis = [
    {
        "id": "rfi-001",
        "rfi_code": "RFI-2025-0089",
        "rfi_type": "TECHNICAL",
        "title": "UPS efficiency specification — PE-Series vs SE-Series applicability",
        "description": "Vendor has submitted datasheet for SE-Series UPS showing efficiency of 95.8%. Project specification clause 4.2.4 requires minimum 96.5% efficiency per IEC 62040-3 Class 1. Vendor claims SE-Series is equivalent. Request clarification on whether PE-Series upgrade is required.",
        "raised_by": "Site QA Engineer",
        "raised_ts": "2025-04-05T09:00:00",
        "status": "resolved",
        "resolution_text": "Confirmed: PE-Series is required. SE-Series does not meet IEC 62040-3 Class 1 at 96.5% minimum efficiency. Vendor must supply PE-Series or equivalent model. Lead time extension of 3 weeks accepted. No cost adjustment to base contract. Vendor to confirm revised delivery date within 5 business days.",
        "equipment_item_ids_json": json.dumps([eq_id]),
        "spec_clause_refs_json": json.dumps(["4.2.4"]),
        "is_resolved": 1
    },
    {
        "id": "rfi-002",
        "rfi_code": "RFI-2025-0091",
        "rfi_type": "TECHNICAL",
        "title": "Battery autonomy — adequacy at 8 minutes vs 10 minutes specified",
        "description": "Vendor proposes battery string providing 8 minutes autonomy at full load versus 10 minutes specified in clause 4.2.6. Vendor claims 8 minutes is adequate for orderly shutdown per ASHRAE A1 guidelines. Request client decision on whether concession can be granted.",
        "raised_by": "Procurement Manager",
        "raised_ts": "2025-04-08T11:00:00",
        "status": "resolved",
        "resolution_text": "Concession NOT granted. 10 minutes minimum is a Tier IV operational requirement per Uptime Institute M&O guidelines. Vendor must extend battery string to achieve minimum 10 minutes autonomy at full rated load. Additional battery cabinet required. Vendor to submit revised technical datasheet with updated battery sizing calculation within 7 business days.",
        "equipment_item_ids_json": json.dumps([eq_id]),
        "spec_clause_refs_json": json.dumps(["4.2.6"]),
        "is_resolved": 1
    },
    {
        "id": "rfi-003",
        "rfi_code": "RFI-2025-0076",
        "rfi_type": "TECHNICAL",
        "title": "Clarification on IP rating requirement for UPS in conditioned room",
        "description": "Specification clause 4.3.1 requires IP31 for UPS equipment. UPS room is fully air-conditioned with positive pressure and controlled access. Vendor standard product is IP20. Is IP31 mandatory given the controlled environment?",
        "raised_by": "Electrical Engineer",
        "raised_ts": "2025-03-25T10:00:00",
        "status": "resolved",
        "resolution_text": "IP31 requirement stands as specified in clause 4.3.1. While the UPS room is conditioned, IP31 provides essential protection against maintenance activities, accidental liquid spills, and incidental ingress during cleaning operations. Vendor must supply IP31 rated equipment or provide third-party test certificate confirming IP31 compliance of submitted equipment. No concession granted.",
        "equipment_item_ids_json": json.dumps([eq_id]),
        "spec_clause_refs_json": json.dumps(["4.3.1"]),
        "is_resolved": 1
    },
    {
        "id": "rfi-004",
        "rfi_code": "RFI-2025-0055",
        "rfi_type": "TECHNICAL",
        "title": "Generator ATS transfer time — 12 seconds vs TIA-942 requirement of 10 seconds",
        "description": "Specification requires ATS transfer within 10 seconds of mains failure. Generator vendor states 12 seconds for full voltage stabilisation at rated load. UPS specified with 10 minute battery autonomy provides adequate bridge. Request confirmation that 12 second ATS is acceptable.",
        "raised_by": "Commissioning Manager",
        "raised_ts": "2025-03-10T14:00:00",
        "status": "resolved",
        "resolution_text": "10 second ATS transfer time is mandatory per TIA-942-B Section 5.3. UPS battery autonomy is not a substitute for ATS compliance — these are independent requirements. Generator vendor must supply faster ATS unit or demonstrate 10 second compliance via FAT. NCR to be raised if not resolved before delivery. Client will not accept derogation.",
        "equipment_item_ids_json": json.dumps([]),
        "spec_clause_refs_json": json.dumps(["4.2.5"]),
        "is_resolved": 1
    },
    {
        "id": "rfi-005",
        "rfi_code": "RFI-2025-0103",
        "rfi_type": "TECHNICAL",
        "title": "Input THDi specification — IEC 61000-3-12 compliance for 1500 kVA UPS",
        "description": "Specification requires input THDi ≤3% at full load per clause 4.2.2. Vendor datasheet states THDi ≤3% with optional active front end (AFE) filter. Standard product without AFE shows THDi of 8-12%. Clarification needed on whether AFE filter is included in scope of supply.",
        "raised_by": "Electrical Design Engineer",
        "raised_ts": "2025-04-15T09:30:00",
        "status": "resolved",
        "resolution_text": "AFE filter is included in scope of supply and must be supplied as standard. THDi ≤3% is a mandatory grid compliance requirement under IEC 61000-3-12 and clause 4.2.2. This is non-negotiable — the data centre's grid connection agreement with the utility requires compliance. Vendor to confirm in writing that AFE filter is included in the revised submittal and final delivery scope.",
        "equipment_item_ids_json": json.dumps([eq_id]),
        "spec_clause_refs_json": json.dumps(["4.2.2"]),
        "is_resolved": 1
    }
]

for rfi_data in rfis:
    db.execute("""
        INSERT OR REPLACE INTO rfis
        (id, rfi_code, rfi_type, title, description, raised_by, raised_ts,
         status, resolution_text, equipment_item_ids_json, spec_clause_refs_json,
         is_resolved, chroma_doc_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rfi_data["id"], rfi_data["rfi_code"], rfi_data["rfi_type"],
        rfi_data["title"], rfi_data["description"], rfi_data["raised_by"],
        rfi_data["raised_ts"], rfi_data["status"], rfi_data["resolution_text"],
        rfi_data["equipment_item_ids_json"], rfi_data["spec_clause_refs_json"],
        rfi_data["is_resolved"], rfi_data["id"]
    ))

db.commit()
print(f"      ✓ {len(rfis)} RFI records inserted into SQLite")

print("      Indexing RFIs in ChromaDB (loading embedding model)...")
for rfi_data in rfis:
    index_text = (
        f"RFI {rfi_data['rfi_code']}: {rfi_data['title']}. "
        f"Question: {rfi_data['description']} "
        f"Resolution: {rfi_data['resolution_text']}"
    )
    index_rfi(
        rfi_id=rfi_data["id"],
        text=index_text,
        metadata={
            "rfi_id": rfi_data["id"],
            "rfi_code": rfi_data["rfi_code"],
            "title": rfi_data["title"],
            "is_resolved": "true" if rfi_data["is_resolved"] else "false",
            "spec_clause_refs": rfi_data.get("spec_clause_refs_json", "[]")
        }
    )
    print(f"        ✓ Indexed {rfi_data['rfi_code']} in ChromaDB")

# ── 8. Index Spec Clauses in ChromaDB ─────────────────────────────────────────
print("\n[8/8] Indexing spec clauses in ChromaDB...")
for clause in spec_clauses:
    if clause["raw_text"]:
        index_text = f"Clause {clause['clause_number']} — {clause['clause_title']}: {clause['raw_text']}"
        index_spec_clause(
            clause_id=clause["id"],
            text=index_text,
            metadata={
                "clause_number": clause["clause_number"],
                "clause_title": clause["clause_title"],
                "document_id": spec_doc_id,
                "equipment_class": clause["equipment_class"],
                "tier": clause["tier"]
            }
        )
print(f"      ✓ {len([c for c in spec_clauses if c['raw_text']])} spec clauses indexed in ChromaDB")

db.close()

print("\n" + "=" * 60)
print("SEED COMPLETE — Summary")
print("=" * 60)
print(f"  Specification document : {spec_doc_id}")
print(f"  Spec clauses           : {len(spec_clauses)}")
print(f"  Equipment item         : {eq_id}")
print(f"  Submittal document     : {sub_doc_id}")
print(f"  Purchase order         : {po_id}")
print(f"    → efficiency_pct     : 95.8% (spec ≥96.5%) — CRITICAL")
print(f"    → battery_autonomy   : 8 min (spec ≥10 min) — MAJOR")
print(f"    → ip_rating          : IP20 (spec IP31)      — MINOR")
print(f"  Schedule tasks         : {len(schedule_tasks)} (zero-float: T-003, T-007, T-012)")
print(f"  RFIs indexed           : {len(rfis)}")
print("")
print("  Next steps:")
print("  1. uvicorn main:app --reload --port 8000")
print("  2. Open http://localhost:5173 → Compliance → Run Check on po-ps1500-001")
print("=" * 60)

