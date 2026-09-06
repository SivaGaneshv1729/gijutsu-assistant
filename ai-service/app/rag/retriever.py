import asyncio
import logging
import os
import time
from typing import List, Optional

import asyncpg
from sentence_transformers import SentenceTransformer

from app.llm.client import generate_rag_answer
from app.rag.prompting import build_context, build_prompt, extractive_answer, no_results_answer
from app.reranking.cross_encoder import get_reranker
from app.evaluation.metrics import get_evaluator

logger = logging.getLogger(__name__)

DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = int(os.getenv("POSTGRES_PORT", "5433"))
DB_NAME = os.getenv("POSTGRES_DB", "mei_platform")
DB_POOL_MIN = int(os.getenv("DB_POOL_MIN", "1"))
DB_POOL_MAX = int(os.getenv("DB_POOL_MAX", "10"))

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "5"))
RERANK_ENABLED = os.getenv("RERANK_ENABLED", "true").lower() in ("1", "true", "yes")

_pool: Optional[asyncpg.Pool] = None
_model: Optional[SentenceTransformer] = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            host=DB_HOST,
            port=DB_PORT,
            min_size=DB_POOL_MIN,
            max_size=DB_POOL_MAX,
        )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info("Loading embedding model %s", EMBEDDING_MODEL)
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model


async def retrieve(query: str, access_level: str, top_k: int = RAG_TOP_K) -> List[dict]:
    """Execute a vector similarity search against pgvector with RBAC filtering."""
    model = get_model()
    query_embedding = model.encode(query).tolist()
    embedding_str = f"[{','.join(map(str, query_embedding))}]"

    pool = await get_pool()

    fetch_k = top_k * 2 if RERANK_ENABLED else top_k

    sql = """
        SELECT dc.id, dc.text_content, d.name, d.access_level
        FROM document_chunks dc
        JOIN documents d ON dc.document_id = d.id
        WHERE UPPER(d.access_level) = 'PUBLIC'
           OR UPPER(d.access_level) = UPPER($2)
        ORDER BY dc.embedding <-> $1
        LIMIT $3
    """

    rows = await pool.fetch(sql, embedding_str, access_level or "PUBLIC", fetch_k)

    chunks = [
        {
            "id": str(row["id"]),
            "text_content": row["text_content"],
            "name": row.get("name", "Unknown"),
            "access_level": row.get("access_level", "public"),
        }
        for row in rows
    ]

    if RERANK_ENABLED and len(chunks) > top_k:
        try:
            reranker = get_reranker()
            chunks = await reranker.async_rerank(query, chunks, top_k=top_k)
        except Exception as e:
            logger.warning("Reranker failed, using raw retrieval: %s", e)
            chunks = chunks[:top_k]

    return chunks[:top_k]


async def retrieve_and_answer(query: str, access_level: str) -> dict:
    """Full RAG pipeline: embed query, retrieve relevant chunks, generate answer."""
    start_time = time.time()

    try:
        citations = await retrieve(query, access_level)
    except Exception as e:
        logger.exception("Retrieval failed")
        return {"answer": f"Database error: {e}", "citations": []}

    answer = await generate_rag_answer(query, citations)

    latency_ms = (time.time() - start_time) * 1000
    evaluator = get_evaluator()
    evaluator.log_query(query, answer, citations, latency_ms)

    return {"answer": answer, "citations": citations}
