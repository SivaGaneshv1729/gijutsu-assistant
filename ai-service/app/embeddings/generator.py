from sentence_transformers import SentenceTransformer
from typing import List
import os

class EmbeddingGenerator:
    def __init__(self):
        model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        self.model = SentenceTransformer(model_name)

    def generate(self, text: str) -> List[float]:
        return self.model.encode(text).tolist()

    def generate_batch(self, texts: List[str]) -> List[List[float]]:
        return self.model.encode(texts).tolist()

# Singleton instance
embedding_generator = EmbeddingGenerator()
