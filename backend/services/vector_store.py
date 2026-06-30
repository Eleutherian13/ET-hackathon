import os
import logging
from typing import List, Dict, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_chroma_client = None
_embedding_model = None


def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        logger.info("Loading sentence-transformers model all-MiniLM-L6-v2 (first run may download ~90MB)")
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Embedding model loaded")
    return _embedding_model


def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        import chromadb
        chroma_path = os.getenv("CHROMA_PATH", "./chroma_db")
        os.makedirs(chroma_path, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=chroma_path)
        logger.info(f"ChromaDB client initialized at {chroma_path}")
    return _chroma_client


def get_or_create_collection(name: str):
    client = get_chroma_client()
    collection = client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"}
    )
    return collection


def embed_text(text: str) -> List[float]:
    model = _get_embedding_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def index_spec_clause(clause_id: str, text: str, metadata: Dict):
    collection = get_or_create_collection("spec_clauses")
    embedding = embed_text(text)
    str_metadata = {k: str(v) for k, v in metadata.items()}
    collection.upsert(
        documents=[text],
        embeddings=[embedding],
        ids=[clause_id],
        metadatas=[str_metadata]
    )
    logger.debug(f"Indexed spec clause {clause_id} in ChromaDB")


def index_rfi(rfi_id: str, text: str, metadata: Dict):
    collection = get_or_create_collection("rfis")
    embedding = embed_text(text)
    str_metadata = {k: str(v) for k, v in metadata.items()}
    collection.upsert(
        documents=[text],
        embeddings=[embedding],
        ids=[rfi_id],
        metadatas=[str_metadata]
    )
    logger.debug(f"Indexed RFI {rfi_id} in ChromaDB")


def search_spec_clauses(query: str, n_results: int = 5) -> List[Dict]:
    collection = get_or_create_collection("spec_clauses")
    count = collection.count()
    if count == 0:
        return []

    n_results = min(n_results, count)
    embedding = embed_text(query)

    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results
    )

    chunks = []
    ids = results["ids"][0]
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for i in range(len(ids)):
        score = max(0.0, 1.0 - distances[i])
        chunks.append({
            "id": ids[i],
            "text": documents[i],
            "metadata": metadatas[i],
            "distance": distances[i],
            "score": round(score, 4)
        })

    return chunks


def search_rfis(query: str, n_results: int = 5) -> List[Dict]:
    collection = get_or_create_collection("rfis")
    count = collection.count()
    if count == 0:
        return []

    n_results = min(n_results, count)
    embedding = embed_text(query)

    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results,
        where={"is_resolved": "true"}
    )

    chunks = []
    ids = results["ids"][0]
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for i in range(len(ids)):
        score = max(0.0, 1.0 - distances[i])
        chunks.append({
            "id": ids[i],
            "text": documents[i],
            "metadata": metadatas[i],
            "distance": distances[i],
            "score": round(score, 4)
        })

    return chunks