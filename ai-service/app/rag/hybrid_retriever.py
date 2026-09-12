from typing import List, Dict, Any
from app.rag.database import get_db, DocumentChunkModel
from app.rag.opensearch_client import os_manager
from app.embeddings.generator import embedding_generator
from sqlalchemy import text
from sqlalchemy.orm import Session

class HybridRetriever:
    def __init__(self, db: Session):
        self.db = db

    def _dense_search(self, query_embedding: List[float], top_k: int = 10) -> List[Dict]:
        """
        Search pgvector using the <-> operator (L2 distance) or <=> (Cosine distance).
        Here we'll use cosine distance.
        """
        # We also need RBAC filtering here in a real scenario
        # e.g., filter by access_level IN (:allowed_levels)
        results = self.db.query(DocumentChunkModel)\
            .order_by(DocumentChunkModel.embedding.cosine_distance(query_embedding))\
            .limit(top_k)\
            .all()
        
        return [
            {
                "chunk_id": r.id,
                "content": r.content,
                "section": r.section,
                "score": 1.0 # placeholder for actual cosine similarity score
            } for r in results
        ]

    def _keyword_search(self, query: str, top_k: int = 10) -> List[Dict]:
        os_results = os_manager.search(query, access_level="PUBLIC", top_k=top_k)
        hits = os_results.get("hits", {}).get("hits", [])
        return [
            {
                "chunk_id": h["_source"]["chunk_id"],
                "content": h["_source"]["content"],
                "section": h["_source"].get("section"),
                "score": h["_score"]
            } for h in hits
        ]

    def retrieve(self, query: str, top_k: int = 5) -> List[Dict]:
        # 1. Generate query embedding
        query_embedding = embedding_generator.generate(query)

        # 2. Dense search
        dense_results = self._dense_search(query_embedding, top_k=top_k*2)
        
        # 3. Keyword search
        keyword_results = self._keyword_search(query, top_k=top_k*2)

        # 4. Reciprocal Rank Fusion (RRF)
        # RRF Score = 1 / (k + rank)
        k = 60
        scores = {}
        chunks = {}

        for rank, res in enumerate(dense_results):
            chunk_id = res["chunk_id"]
            scores[chunk_id] = scores.get(chunk_id, 0) + 1.0 / (k + rank + 1)
            chunks[chunk_id] = res

        for rank, res in enumerate(keyword_results):
            chunk_id = res["chunk_id"]
            scores[chunk_id] = scores.get(chunk_id, 0) + 1.0 / (k + rank + 1)
            chunks[chunk_id] = res

        # Sort by RRF score
        sorted_chunk_ids = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)
        
        final_results = []
        for cid in sorted_chunk_ids[:top_k]:
            res = chunks[cid]
            res["rrf_score"] = scores[cid]
            final_results.append(res)

        return final_results
