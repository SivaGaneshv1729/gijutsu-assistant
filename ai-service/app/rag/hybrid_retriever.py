from typing import List, Dict, Any
from app.rag.database import get_db
from app.rag.opensearch_client import os_manager
from app.embeddings.generator import embedding_generator
from sqlalchemy import text
from sqlalchemy.orm import Session

class HybridRetriever:
    def __init__(self, db: Session):
        self.db = db

    # RBAC hierarchy: higher roles can access all lower-level documents
    ACCESS_HIERARCHY = {
        "PUBLIC":               ["PUBLIC"],
        "OPERATOR":             ["PUBLIC", "OPERATOR"],
        "MAINTENANCE_ENGINEER": ["PUBLIC", "OPERATOR", "MAINTENANCE_ENGINEER"],
        "ENGINEER":             ["PUBLIC", "OPERATOR", "MAINTENANCE_ENGINEER", "ENGINEER"],
        "MANAGER":              ["PUBLIC", "OPERATOR", "MAINTENANCE_ENGINEER", "ENGINEER", "MANAGER"],
        "ADMIN":                ["PUBLIC", "OPERATOR", "MAINTENANCE_ENGINEER", "ENGINEER", "MANAGER", "ADMIN"],
    }

    def _get_permitted_levels(self, access_level: str) -> list:
        """Return the list of access levels this role is permitted to view."""
        return self.ACCESS_HIERARCHY.get(access_level.upper(), ["PUBLIC"])

    def _dense_search(self, query_embedding: List[float], access_level: str, top_k: int = 10) -> List[Dict]:
        """
        RBAC-before-retrieval dense search against pgvector (see ADR-005).

        Uses a proper role hierarchy: ADMIN can see everything, ENGINEER can see
        PUBLIC + OPERATOR + MAINTENANCE_ENGINEER + ENGINEER, etc.
        """
        permitted = self._get_permitted_levels(access_level)
        vector_literal = "[" + ",".join(str(float(x)) for x in query_embedding) + "]"

        # Build parameterized IN clause
        level_params = {f"level_{i}": lvl for i, lvl in enumerate(permitted)}
        level_placeholders = ", ".join(f":level_{i}" for i in range(len(permitted)))

        sql = text(f"""
            SELECT dc.id AS chunk_id,
                   dc.content AS content,
                   d.name AS doc_name,
                   d.access_level AS access_level
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE UPPER(d.access_level) IN ({level_placeholders})
            ORDER BY dc.embedding <-> CAST(:query AS vector)
            LIMIT :top_k
        """)

        params = {"query": vector_literal, "top_k": top_k, **level_params}
        rows = self.db.execute(sql, params).fetchall()

        return [
            {
                "chunk_id": r.chunk_id,
                "content": r.content,
                "section": None,
                "doc_name": r.doc_name,
                "access_level": r.access_level,
            }
            for r in rows
        ]

    def _keyword_search(self, query: str, access_level: str, top_k: int = 10) -> List[Dict]:
        """
        Best-effort keyword search over OpenSearch (reserved / optionally deployed).

        OpenSearch is not populated by the ingestion pipeline and its security is
        disabled in the default compose stack, so failures are tolerated here to
        keep the dense-only path working. When present, results are filtered to
        the caller's permitted access levels.
        """
        try:
            os_results = os_manager.search(query, access_level=access_level, top_k=top_k)
            hits = os_results.get("hits", {}).get("hits", [])
            return [
                {
                    "chunk_id": h["_source"]["chunk_id"],
                    "content": h["_source"].get("content", ""),
                    "section": h["_source"].get("section"),
                    "doc_name": h["_source"].get("doc_name"),
                    "access_level": h["_source"].get("access_level"),
                    "score": h["_score"],
                }
                for h in hits
            ]
        except Exception:
            return []

    def retrieve(self, query: str, access_level: str = "OPERATOR", top_k: int = 5) -> List[Dict]:
        # 1. Generate query embedding
        query_embedding = embedding_generator.generate(query)

        # 2. Dense search (RBAC-filtered)
        dense_results = self._dense_search(query_embedding, access_level, top_k=top_k * 2)

        # 3. Keyword search (best-effort)
        keyword_results = self._keyword_search(query, access_level, top_k=top_k * 2)

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
            res = dict(chunks[cid])
            res["rrf_score"] = scores[cid]
            final_results.append(res)

        return final_results