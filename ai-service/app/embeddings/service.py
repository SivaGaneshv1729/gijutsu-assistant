import logging
import os
from typing import List, Optional

import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
EMBEDDING_DIMENSION = 384


class EmbeddingService:
    """Local sentence-transformers embedding service. Zero API cost."""

    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self._model: Optional[SentenceTransformer] = None
        self._model_name = model_name

    def _load_model(self) -> SentenceTransformer:
        if self._model is None:
            logger.info("Loading embedding model: %s", self._model_name)
            self._model = SentenceTransformer(self._model_name)
        return self._model

    def embed_text(self, text: str) -> List[float]:
        """Embed a single text string."""
        model = self._load_model()
        embedding = model.encode(text)
        return embedding.tolist()

    def embed_batch(self, texts: List[str], batch_size: int = 64) -> List[List[float]]:
        """Embed a batch of texts efficiently."""
        model = self._load_model()
        embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=False)
        return embeddings.tolist()

    def embed_query(self, query: str) -> List[float]:
        """Embed a user query (same model, single text)."""
        return self.embed_text(query)

    @property
    def dimension(self) -> int:
        return EMBEDDING_DIMENSION

    @property
    def model_name(self) -> str:
        return self._model_name


_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    global _service
    if _service is None:
        _service = EmbeddingService()
    return _service
