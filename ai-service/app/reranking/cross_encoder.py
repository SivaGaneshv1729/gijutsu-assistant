import logging
import os
from typing import List, Optional, Tuple

logger = logging.getLogger(__name__)

RERANK_MODEL = os.getenv("RERANK_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")


class CrossEncoderReranker:
    """Cross-encoder reranker for reordering retrieved chunks by relevance. Local, zero cost."""

    def __init__(self, model_name: str = RERANK_MODEL):
        self._model = None
        self._model_name = model_name

    def _load_model(self):
        if self._model is None:
            from sentence_transformers import CrossEncoder
            logger.info("Loading reranker model: %s", self._model_name)
            self._model = CrossEncoder(self._model_name)
        return self._model

    def rerank(
        self, query: str, chunks: List[dict], top_k: int = 5
    ) -> List[dict]:
        """Rerank a list of chunks by relevance to the query.

        Each chunk must have a 'text_content' key. Returns the top_k chunks
        sorted by cross-encoder score (descending).
        """
        if not chunks:
            return []

        model = self._load_model()
        pairs = [(query, c["text_content"]) for c in chunks]
        scores = model.predict(pairs)

        scored_chunks = list(zip(chunks, scores))
        scored_chunks.sort(key=lambda x: x[1], reverse=True)

        reranked = []
        for chunk, score in scored_chunks[:top_k]:
            chunk["rerank_score"] = float(score)
            reranked.append(chunk)
        return reranked

    async def async_rerank(
        self, query: str, chunks: List[dict], top_k: int = 5
    ) -> List[dict]:
        """Async-compatible rerank (runs sync model in thread pool)."""
        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.rerank, query, chunks, top_k)


_reranker: Optional[CrossEncoderReranker] = None


def get_reranker() -> CrossEncoderReranker:
    global _reranker
    if _reranker is None:
        _reranker = CrossEncoderReranker()
    return _reranker
