import re
import json
import uuid
import logging
from datetime import datetime
from typing import List, Dict, Optional

from services.pdf_extractor import extract_text_from_pdf
from services.llm_client import call_claude_json
from services.vector_store import index_spec_clause
from database.connection import get_db

logger = logging.getLogger(__name__)

CLAUSE_EXTRACTION_SYSTEM = """You are a technical specification analyst for data centre EPC projects.
Extract structured requirements from the following specification clause text.

Return a JSON object with these exact fields:
{
  "equipment_class": "UPS|CRAC|GENERATOR|SWITCHGEAR|OTHER",
  "clause_type": "TECHNICAL|ADMINISTRATIVE|TESTING|REFERENCE",
  "applicable_tier": "TIER_III|TIER_IV|BOTH|N/A",
  "requirements": [
    {
      "attribute": "snake_case_attribute_name",
      "required_value": <number or string>,
      "tolerance_type": "MIN|MAX|EXACT|RANGE",
      "tolerance_pct": <number or null>,
      "unit": "unit string or empty string",
      "mandatory": true,
      "description": "brief description of requirement"
    }
  ],
  "ambiguity_flags": ["list of any ambiguous requirements if any"],
  "standards_referenced": ["e.g. IEC 62040-3", "TIA-942-B"]
}

Return ONLY valid JSON. No preamble. No markdown fences."""


def parse_spec_document(document_id: str, file_path: str) -> List[Dict]:
    pages = extract_text_from_pdf(file_path)
    if not pages:
        logger.warning(f"No pages extracted from {file_path}")
        return []

    clauses = segment_into_clauses(pages)
    extracted_clauses = []

    db = get_db()
    try:
        for clause in clauses:
            if not should_extract(clause):
                continue

            clause_data = extract_clause_requirements(clause, document_id)
            if not clause_data:
                continue

            clause_id = str(uuid.uuid4())
            requirements_json = json.dumps(clause_data.get("requirements", []))
            page_refs_json = json.dumps(clause.get("pages", [1]))

            db.execute("""
                INSERT OR REPLACE INTO spec_clauses
                (id, document_id, clause_number, clause_title, equipment_class,
                 clause_type, raw_text, requirements_json, tier, page_refs_json, extracted_ts)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                clause_id,
                document_id,
                clause["clause_number"],
                clause["clause_title"][:200] if clause.get("clause_title") else "",
                clause_data.get("equipment_class", "UPS"),
                clause_data.get("clause_type", "TECHNICAL"),
                clause["text"][:5000],
                requirements_json,
                clause_data.get("applicable_tier", "TIER_IV"),
                page_refs_json,
                datetime.utcnow().isoformat()
            ))
            db.commit()

            # Index in ChromaDB
            index_text = f"Clause {clause['clause_number']} {clause['clause_title']}: {clause['text'][:1000]}"
            index_spec_clause(
                clause_id=clause_id,
                text=index_text,
                metadata={
                    "clause_number": clause["clause_number"],
                    "clause_title": clause.get("clause_title", ""),
                    "document_id": document_id,
                    "equipment_class": clause_data.get("equipment_class", "UPS"),
                    "tier": clause_data.get("applicable_tier", "TIER_IV")
                }
            )

            clause_data["id"] = clause_id
            clause_data["clause_number"] = clause["clause_number"]
            extracted_clauses.append(clause_data)

    finally:
        db.close()

    logger.info(f"Extracted {len(extracted_clauses)} clauses from document {document_id}")
    return extracted_clauses


def segment_into_clauses(pages: List[Dict]) -> List[Dict]:
    full_text = "\n".join([p["text"] for p in pages])
    clause_pattern = re.compile(r"(?m)^(\d+(?:\.\d+)+)\s+([A-Z][^\n]{3,80})")
    matches = list(clause_pattern.finditer(full_text))

    if not matches:
        return [{
            "clause_number": "1",
            "clause_title": "Full Document",
            "text": full_text[:8000],
            "pages": [p["page_num"] for p in pages]
        }]

    clauses = []
    for i, match in enumerate(matches):
        start_pos = match.start()
        end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        clause_text = full_text[start_pos:end_pos].strip()

        # Determine page numbers for this clause
        char_count = 0
        clause_pages = []
        for page in pages:
            page_start = char_count
            page_end = char_count + len(page["text"])
            if start_pos <= page_end and char_count <= end_pos:
                clause_pages.append(page["page_num"])
            char_count += len(page["text"]) + 1

        clauses.append({
            "clause_number": match.group(1),
            "clause_title": match.group(2).strip()[:120],
            "text": clause_text[:6000],
            "pages": clause_pages if clause_pages else [1]
        })

    return clauses


def extract_clause_requirements(clause: Dict, document_id: str) -> Optional[Dict]:
    user_message = f"""Extract structured requirements from this specification clause.

CLAUSE {clause['clause_number']}: {clause.get('clause_title', '')}

TEXT:
{clause['text'][:3000]}"""

    try:
        result = call_claude_json(CLAUSE_EXTRACTION_SYSTEM, user_message, max_tokens=1500)
        return result
    except Exception as e:
        logger.error(f"Failed to extract requirements from clause {clause['clause_number']}: {str(e)}")
        return None


def should_extract(clause: Dict) -> bool:
    text = clause.get("text", "")
    words = text.split()

    if len(words) < 20:
        return False

    has_numbers = bool(re.search(r'\d+(?:\.\d+)?(?:\s*%|\s*kVA|\s*kW|\s*Hz|\s*V|\s*ms|\s*min)', text))
    has_requirement_keywords = any(kw in text.lower() for kw in [
        "shall", "must", "minimum", "maximum", "required", "rating", "efficiency",
        "voltage", "current", "frequency", "power", "capacity", "protection"
    ])

    admin_only_patterns = [
        r'^\s*revision history',
        r'^\s*table of contents',
        r'^\s*document control',
        r'^\s*approval signatures'
    ]
    for pattern in admin_only_patterns:
        if re.search(pattern, text[:200], re.IGNORECASE):
            return False

    return has_numbers or (has_requirement_keywords and len(words) >= 30)