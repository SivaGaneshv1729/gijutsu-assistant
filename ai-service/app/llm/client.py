import logging
import os
from typing import List, Optional

import httpx

from app.rag.prompting import build_context, build_prompt, extractive_answer, no_results_answer

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")
USE_LLM = os.getenv("USE_LLM", "true").lower() in ("1", "true", "yes")


async def check_ollama_health() -> bool:
    """Check if Ollama is reachable."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return resp.status_code == 200
    except Exception:
        return False


async def list_models() -> List[str]:
    """List available models on the Ollama instance."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                return [m["name"] for m in data.get("models", [])]
    except Exception as e:
        logger.warning("Failed to list Ollama models: %s", e)
    return []


async def generate_completion(
    prompt: str,
    model: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: int = 512,
) -> str:
    """Generate a text completion using a local Ollama model."""
    model = model or OLLAMA_MODEL

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens,
        },
    }

    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("response", "").strip()
            if resp.status_code in (500, 503):
                import asyncio
                await asyncio.sleep(2 * (attempt + 1))
                continue
            logger.error("Ollama error %s: %s", resp.status_code, resp.text[:500])
            break
        except Exception as e:
            logger.exception("Ollama request failed")
            if attempt < 2:
                import asyncio
                await asyncio.sleep(2)
            else:
                return f"An error occurred while contacting the local LLM: {e}"

    return ""


async def generate_rag_answer(query: str, citations: List[dict]) -> str:
    """Generate a grounded answer from retrieved context using the local Ollama LLM."""
    if not citations:
        return no_results_answer()

    if not USE_LLM:
        logger.warning("USE_LLM disabled; returning extractive answer")
        return extractive_answer(citations)

    prompt = build_prompt(query, citations)
    answer = await generate_completion(prompt)

    if not answer:
        top = citations[0]
        return (
            "I could not generate a full answer right now. Here is what I found:\n\n"
            f"**Source:** {top['name']}\n{top['text_content']}"
        )

    return answer
