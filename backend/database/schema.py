import logging
from database.connection import get_db

logger = logging.getLogger(__name__)


def init_db():
    db = get_db()
    try:
        db.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                doc_type TEXT NOT NULL,
                upload_ts TEXT NOT NULL,
                file_path TEXT,
                status TEXT NOT NULL DEFAULT 'uploaded',
                page_count INTEGER DEFAULT 0
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS spec_clauses (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL REFERENCES documents(id),
                clause_number TEXT NOT NULL,
                clause_title TEXT,
                equipment_class TEXT NOT NULL DEFAULT 'UPS',
                clause_type TEXT DEFAULT 'TECHNICAL',
                raw_text TEXT,
                requirements_json TEXT NOT NULL DEFAULT '[]',
                tier TEXT DEFAULT 'TIER_IV',
                page_refs_json TEXT DEFAULT '[]',
                extracted_ts TEXT
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS equipment_items (
                id TEXT PRIMARY KEY,
                item_code TEXT NOT NULL,
                description TEXT NOT NULL,
                equipment_class TEXT NOT NULL,
                design_zone TEXT,
                quantity INTEGER DEFAULT 1,
                unit TEXT DEFAULT 'EA',
                required_by_date TEXT,
                spec_clause_ids_json TEXT DEFAULT '[]',
                criticality TEXT DEFAULT 'HIGH',
                compliance_score REAL DEFAULT 1.0
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS purchase_orders (
                id TEXT PRIMARY KEY,
                po_number TEXT NOT NULL,
                vendor_name TEXT NOT NULL,
                vendor_country TEXT DEFAULT 'India',
                document_id TEXT REFERENCES documents(id),
                equipment_item_id TEXT REFERENCES equipment_items(id),
                po_date TEXT,
                technical_attributes_json TEXT DEFAULT '{}',
                compliance_status TEXT DEFAULT 'PENDING',
                deviation_count INTEGER DEFAULT 0,
                checked_ts TEXT
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS deviations (
                id TEXT PRIMARY KEY,
                po_id TEXT NOT NULL REFERENCES purchase_orders(id),
                spec_clause_id TEXT REFERENCES spec_clauses(id),
                attribute_name TEXT NOT NULL,
                specified_value TEXT NOT NULL,
                submitted_value TEXT NOT NULL,
                deviation_pct REAL,
                severity TEXT NOT NULL,
                deviation_type TEXT DEFAULT 'VALUE',
                w_conform REAL DEFAULT 0.5,
                detected_ts TEXT NOT NULL
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS ncrs (
                id TEXT PRIMARY KEY,
                deviation_id TEXT NOT NULL REFERENCES deviations(id),
                po_id TEXT NOT NULL REFERENCES purchase_orders(id),
                equipment_item_id TEXT REFERENCES equipment_items(id),
                title TEXT NOT NULL,
                description TEXT,
                severity TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                raised_ts TEXT NOT NULL,
                due_date TEXT,
                assigned_to TEXT DEFAULT 'Quality Manager',
                resolution_text TEXT,
                spec_clause_ref TEXT,
                page_ref TEXT,
                schedule_impact_json TEXT DEFAULT '{}',
                actions_json TEXT DEFAULT '[]'
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS schedule_tasks (
                id TEXT PRIMARY KEY,
                task_code TEXT NOT NULL,
                description TEXT NOT NULL,
                planned_start TEXT NOT NULL,
                planned_finish TEXT NOT NULL,
                total_float_days INTEGER NOT NULL DEFAULT 0,
                original_float_days INTEGER NOT NULL DEFAULT 0,
                predecessor_ids_json TEXT DEFAULT '[]',
                equipment_item_id TEXT REFERENCES equipment_items(id),
                percent_complete REAL DEFAULT 0.0,
                risk_score REAL DEFAULT 0.0,
                delay_probability REAL DEFAULT 0.0,
                mitigation_text TEXT,
                risk_checked_ts TEXT
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS rfis (
                id TEXT PRIMARY KEY,
                rfi_code TEXT NOT NULL,
                rfi_type TEXT DEFAULT 'TECHNICAL',
                title TEXT NOT NULL,
                description TEXT,
                raised_by TEXT,
                raised_ts TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                response_due_ts TEXT,
                resolution_text TEXT,
                equipment_item_ids_json TEXT DEFAULT '[]',
                spec_clause_refs_json TEXT DEFAULT '[]',
                chroma_doc_id TEXT,
                is_resolved INTEGER DEFAULT 0
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS agent_runs (
                id TEXT PRIMARY KEY,
                agent_name TEXT NOT NULL,
                trigger_event TEXT,
                input_summary TEXT,
                output_summary TEXT,
                status TEXT NOT NULL DEFAULT 'running',
                started_ts TEXT NOT NULL,
                completed_ts TEXT,
                error_text TEXT,
                records_processed INTEGER DEFAULT 0,
                records_created INTEGER DEFAULT 0
            )
        """)

        # Indexes
        db.execute("CREATE INDEX IF NOT EXISTS idx_spec_clauses_doc ON spec_clauses(document_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_spec_clauses_class ON spec_clauses(equipment_class)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_deviations_po ON deviations(po_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_deviations_severity ON deviations(severity)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_deviations_clause ON deviations(spec_clause_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_ncrs_severity ON ncrs(severity)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_ncrs_status ON ncrs(status)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_ncrs_po ON ncrs(po_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_ncrs_equipment ON ncrs(equipment_item_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_schedule_risk ON schedule_tasks(risk_score)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_schedule_equipment ON schedule_tasks(equipment_item_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_rfis_resolved ON rfis(is_resolved)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_po_equipment ON purchase_orders(equipment_item_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_agent_runs_name ON agent_runs(agent_name)")

        db.commit()
        logger.info("Database initialized successfully")
    finally:
        db.close()