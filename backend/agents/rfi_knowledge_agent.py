import json
import uuid
import logging
import re
from datetime import datetime
from typing import List, Dict

from database.connection import get_db
from services.llm_client import call_claude
from services.vector_store import search_spec_clauses, search_rfis

logger = logging.getLogger(__name__)

RAG_SYSTEM = """You are a senior technical manager on a Tier IV hyperscale data centre EPC project with 15 years of experience in critical infrastructure construction. You answer questions from the project team using ONLY the information provided in the context below.

Rules:
1. Answer ONLY from the provided context. Do not use general knowledge not present in the context.
2. Cite every factual claim using the format [doc_id | clause_number | page].
3. If a precedent RFI resolved a similar issue, lead your answer with it — it is the most valuable piece of information.
4. If the context does not contain sufficient information to answer, say explicitly: "The project documents do not contain a definitive answer to this query. Based on available context: [what you can infer]."
5. Be direct and actionable. Engineers need decisions, not open-ended discussions.
6. Structure your answer clearly: lead with the precedent (if any), then the direct answer, then supporting detail."""


def answer_rfi_query(query: str) -> Dict:
    agent_run_id = str(uuid.uuid4())
    started_ts = datetime.utcnow().isoformat()
    db = get_db()

    try:
        # Step 1: Search spec clauses
        spec_results = search_spec_clauses(query, n_results=5)

        # Step 2: Search RFIs
        rfi_results = search_rfis(query, n_results=3)

        # Step 3: Find precedent RFIs (score > 0.82 and resolved)
        precedent_rfis = find_precedent_rfis(rfi_results, db)

        # Step 4: Build context string
        all_chunks = []
        context_blocks = []

        for i, chunk in enumerate(spec_results):
            chunk_label = f"[SPEC_CLAUSE | {chunk['metadata'].get('clause_number', 'N/A')} | doc:{chunk['metadata'].get('document_id', 'N/A')}]"
            context_blocks.append(f"SOURCE {i+1} {chunk_label}\n{chunk['text'][:800]}")
            all_chunks.append({
                "rank": i + 1,
                "id": chunk["id"],
                "doc_type": "spec_clause",
                "clause_number": chunk["metadata"].get("clause_number", ""),
                "document_id": chunk["metadata"].get("document_id", ""),
                "score": chunk["score"],
                "text": chunk["text"]
            })

        offset = len(spec_results)
        for i, chunk in enumerate(rfi_results):
            chunk_label = f"[RFI | {chunk['metadata'].get('rfi_code', 'N/A')} | resolved:{chunk['metadata'].get('is_resolved', 'false')}]"
            context_blocks.append(f"SOURCE {offset+i+1} {chunk_label}\n{chunk['text'][:800]}")
            all_chunks.append({
                "rank": offset + i + 1,
                "id": chunk["id"],
                "doc_type": "rfi",
                "rfi_code": chunk["metadata"].get("rfi_code", ""),
                "score": chunk["score"],
                "text": chunk["text"]
            })

        context_text = "\n\n---\n\n".join(context_blocks) if context_blocks else "No relevant documents found in project corpus."

        precedent_section = ""
        if precedent_rfis:
            lines = ["PRECEDENT RFIs FOUND (similarity > 0.82):"]
            for p in precedent_rfis:
                lines.append(f"- {p['rfi_code']}: {p['title']} | Resolution: {p['resolution_summary'][:200]}")
            precedent_section = "\n".join(lines)

        user_message = f"""CONTEXT:
{context_text}

{precedent_section}

QUERY FROM PROJECT TEAM:
{query}

Answer using only the context above. Cite all claims. Lead with any precedent. Be specific and actionable."""

        # Step 5: Call Claude
        answer_text = call_claude(RAG_SYSTEM, user_message, max_tokens=1500)

        # Step 6: Build citations
        citations = extract_citations_from_response(answer_text, all_chunks)

        # Step 7: Compute confidence
        confidence = compute_confidence(spec_results + rfi_results)

        # Step 8: Log agent run
        db.execute("""
            INSERT OR REPLACE INTO agent_runs
            (id, agent_name, trigger_event, input_summary, output_summary,
             status, started_ts, completed_ts, records_processed, records_created)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            agent_run_id, "rfi_knowledge", f"rfi_query",
            f"Query: {query[:100]}",
            f"Confidence: {confidence:.2f} | {len(precedent_rfis)} precedents | {len(all_chunks)} sources",
            "completed", started_ts, datetime.utcnow().isoformat(),
            len(all_chunks), 0
        ))
        db.commit()

        sources = []
        for chunk in all_chunks:
            sources.append({
                "doc_id": chunk["id"],
                "clause_number": chunk.get("clause_number") or chunk.get("rfi_code", ""),
                "page_ref": chunk.get("document_id", ""),
                "score": chunk["score"],
                "text_preview": chunk["text"][:120]
            })

        return {
            "answer": answer_text,
            "sources": sources,
            "precedent_rfis": precedent_rfis,
            "confidence": confidence,
            "agent_run_id": agent_run_id
        }

    except Exception as e:
        logger.error(f"RFI query failed: {str(e)}")
        try:
            db.execute("""
                INSERT OR REPLACE INTO agent_runs
                (id, agent_name, trigger_event, status, started_ts, completed_ts, error_text)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                agent_run_id, "rfi_knowledge", "rfi_query",
                "failed", started_ts, datetime.utcnow().isoformat(), str(e)
            ))
            db.commit()
        except Exception:
            pass
        raise
    finally:
        db.close()


def find_precedent_rfis(rfi_results: List[Dict], db) -> List[Dict]:
    precedents = []
    for chunk in rfi_results:
        if chunk["score"] > 0.82 and chunk["metadata"].get("is_resolved") == "true":
            rfi_id = chunk["id"]
            rfi_row = db.execute(
                "SELECT id, rfi_code, title, resolution_text FROM rfis WHERE id = ?",
                (rfi_id,)
            ).fetchone()
            if rfi_row:
                rfi_row = dict(rfi_row)
                resolution_summary = (rfi_row.get("resolution_text") or "")[:300]
                precedents.append({
                    "rfi_id": rfi_row["id"],
                    "rfi_code": rfi_row.get("rfi_code", ""),
                    "title": rfi_row.get("title", ""),
                    "resolution_summary": resolution_summary,
                    "similarity_score": chunk["score"]
                })
    return precedents


def extract_citations_from_response(response_text: str, retrieved_chunks: List[Dict]) -> List[Dict]:
    citation_pattern = re.compile(r'\[([^\]|]+)\|([^\]|]+)\|([^\]]*)\]')
    found_citations = []
    for match in citation_pattern.finditer(response_text):
        doc_id_part = match.group(1).strip()
        clause_part = match.group(2).strip()
        page_part = match.group(3).strip()
        for chunk in retrieved_chunks:
            clause_num = chunk.get("clause_number", "") or chunk.get("rfi_code", "")
            if clause_part in str(clause_num) or clause_num in clause_part:
                found_citations.append({
                    "doc_id": chunk["id"],
                    "clause_number": clause_num,
                    "page_ref": page_part,
                    "score": chunk["score"],
                    "text_preview": chunk["text"][:100]
                })
                break
    if not found_citations and retrieved_chunks:
        top = retrieved_chunks[0]
        found_citations.append({
            "doc_id": top["id"],
            "clause_number": top.get("clause_number", "") or top.get("rfi_code", ""),
            "page_ref": "",
            "score": top["score"],
            "text_preview": top["text"][:100]
        })
    return found_citations


def compute_confidence(retrieved_chunks: List[Dict]) -> float:
    if not retrieved_chunks:
        return 0.0
    spec_chunks = [c for c in retrieved_chunks if c.get("doc_type") == "spec_clause" or "clause_number" in c.get("metadata", {})]
    if spec_chunks:
        return round(max(c["score"] for c in spec_chunks), 4)
    return round(max(c["score"] for c in retrieved_chunks), 4)