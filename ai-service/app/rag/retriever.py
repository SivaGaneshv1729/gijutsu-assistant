import asyncio
import logging
import os
from typing import List, Optional

import asyncpg
import httpx
from sentence_transformers import SentenceTransformer

from app.rag.prompting import build_context, build_prompt, extractive_answer, no_results_answer

logger = logging.getLogger(__name__)

# Database configuration (overridable via environment variables)
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = int(os.getenv("POSTGRES_PORT", "5433"))
DB_NAME = os.getenv("POSTGRES_DB", "mei_platform")
DB_POOL_MIN = int(os.getenv("DB_POOL_MIN", "1"))
DB_POOL_MAX = int(os.getenv("DB_POOL_MAX", "10"))

# Embedding model configuration
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# LLM configuration (free Hugging Face Inference API)
HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL = os.getenv("HF_MODEL", "google/flan-t5-large")
HF_API_URL = os.getenv("HF_API_URL", f"https://api-inference.huggingface.co/models/{HF_MODEL}")
USE_LLM = os.getenv("USE_LLM", "true").lower() in ("1", "true", "yes")

# Retrieval configuration
TOP_K = int(os.getenv("RAG_TOP_K", "5"))

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


async def retrieve(query: str, access_level: str, top_k: int = TOP_K) -> List[dict]:
    """Execute a vector similarity search against pgvector with RBAC filtering."""
    model = get_model()
    query_embedding = model.encode(query).tolist()
    embedding_str = f"[{','.join(map(str, query_embedding))}]"

    pool = await get_pool()

    # Filter: PUBLIC documents are visible to everyone; otherwise the document's
    # access_level must match the caller's role (case-insensitive).
    sql = """
        SELECT dc.id, dc.text_content, d.name, d.access_level
        FROM document_chunks dc
        JOIN documents d ON dc.document_id = d.id
        WHERE UPPER(d.access_level) = 'PUBLIC'
           OR UPPER(d.access_level) = UPPER($2)
        ORDER BY dc.embedding <-> $1
        LIMIT $3
    """

    rows = await pool.fetch(sql, embedding_str, access_level or "PUBLIC", top_k)

    return [
        {
            "id": str(row["id"]),
            "text_content": row["text_content"],
            "name": row.get("name", "Unknown"),
            "access_level": row.get("access_level", "public"),
        }
        for row in rows
    ]


async def generate_answer(query: str, citations: List[dict]) -> str:
    """Generate a grounded answer using the free Hugging Face Inference API."""
    if not citations:
        return no_results_answer()

    if not USE_LLM or not HF_TOKEN:
        logger.warning("USE_LLM disabled or HF_TOKEN not set; returning extractive answer")
        return extractive_answer(citations)

    prompt = build_prompt(query, citations)

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 350,
            "temperature": 0.2,
            "do_sample": False,
        },
    }
    headers = {"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"}

    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(HF_API_URL, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list) and data:
                    generated = data[0].get("generated_text", "")
                elif isinstance(data, dict):
                    generated = data.get("generated_text", "")
                else:
                    generated = ""
                answer = generated.replace(prompt, "").strip()
                return answer or "I could not generate an answer at this time."
            if resp.status_code in (500, 503):
                await asyncio.sleep(2 * (attempt + 1))
                continue
            logger.error("HF Inference API error %s: %s", resp.status_code, resp.text[:500])
            break
        except Exception as e:
            logger.exception("Hugging Face inference request failed")
            if attempt < 2:
                await asyncio.sleep(2)
            else:
                return f"An error occurred while contacting the language model: {e}"

    top = citations[0]
    return (
        "I could not generate a full answer right now. Here is what I found in the knowledge base:\n\n"
        f"**Source:** {top['name']}\n{top['text_content']}"
    )


async def retrieve_and_answer(query: str, access_level: str) -> dict:
    """Full RAG pipeline: embed query, retrieve relevant chunks, generate answer."""
    try:
        citations = await retrieve(query, access_level)
    except Exception as e:
        logger.exception("Retrieval failed")
        return {"answer": f"Database error: {e}", "citations": []}

    answer = await generate_answer(query, citations)

    return {"answer": answer, "citations": citations}