import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> List[Dict]:
    try:
        import fitz
    except ImportError:
        raise ImportError("PyMuPDF (fitz) is required. Run: pip install PyMuPDF")

    pages = []
    try:
        doc = fitz.open(file_path)

        if doc.is_encrypted:
            logger.warning(f"PDF is encrypted and cannot be read: {file_path}")
            doc.close()
            return []

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            word_count = len(text.split()) if text else 0
            pages.append({
                "page_num": page_num + 1,
                "text": text,
                "word_count": word_count
            })

        doc.close()
        logger.info(f"Extracted {len(pages)} pages from {file_path}")
        return pages

    except Exception as e:
        logger.error(f"Failed to extract text from PDF {file_path}: {str(e)}")
        return []


def extract_full_text(file_path: str) -> str:
    pages = extract_text_from_pdf(file_path)
    if not pages:
        return ""
    separator = "\n--- PAGE {page_num} ---\n"
    parts = []
    for p in pages:
        parts.append(f"\n--- PAGE {p['page_num']} ---\n{p['text']}")
    return "".join(parts)