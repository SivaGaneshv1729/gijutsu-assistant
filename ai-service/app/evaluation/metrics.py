import logging
import os
from typing import Any, Dict, List, Optional

import numpy as np

logger = logging.getLogger(__name__)


class RAGEvaluator:
    """Evaluation metrics for the RAG pipeline. Local computation, zero API cost."""

    def __init__(self):
        self._history: List[Dict[str, Any]] = []

    def compute_retrieval_metrics(
        self,
        query: str,
        retrieved_chunks: List[dict],
        ground_truth_chunks: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Compute retrieval quality metrics."""
        metrics: Dict[str, Any] = {
            "num_chunks_retrieved": len(retrieved_chunks),
            "query_length": len(query),
        }

        if not retrieved_chunks:
            metrics["avg_chunk_length"] = 0
            metrics["unique_sources"] = 0
            return metrics

        lengths = [len(c.get("text_content", "")) for c in retrieved_chunks]
        metrics["avg_chunk_length"] = float(np.mean(lengths))
        metrics["unique_sources"] = len(set(c.get("name", "") for c in retrieved_chunks))

        if ground_truth_chunks:
            retrieved_texts = [c.get("text_content", "") for c in retrieved_chunks]
            hits = sum(1 for gt in ground_truth_chunks if any(gt in rt for rt in retrieved_texts))
            metrics["recall_at_k"] = hits / len(ground_truth_chunks) if ground_truth_chunks else 0.0

        return metrics

    def compute_answer_metrics(
        self,
        query: str,
        answer: str,
        citations: List[dict],
    ) -> Dict[str, Any]:
        """Compute answer quality metrics."""
        metrics: Dict[str, Any] = {
            "answer_length": len(answer),
            "num_citations": len(citations),
            "has_answer": bool(answer.strip()),
        }

        if citations:
            source_names = [c.get("name", "unknown") for c in citations]
            metrics["sources_used"] = list(set(source_names))

        citation_ratio = len(answer) / max(len(citations), 1)
        metrics["citation_density"] = round(citation_ratio, 1)

        return metrics

    def log_query(
        self,
        query: str,
        answer: str,
        citations: List[dict],
        latency_ms: float,
        model: str = "",
    ) -> None:
        """Log a query for offline analysis."""
        entry = {
            "query": query,
            "answer_preview": answer[:200],
            "num_citations": len(citations),
            "latency_ms": latency_ms,
            "model": model,
        }
        self._history.append(entry)
        if len(self._history) > 500:
            self._history = self._history[-500:]

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self._history[-limit:]

    def get_summary(self) -> Dict[str, Any]:
        if not self._history:
            return {"total_queries": 0}

        latencies = [h["latency_ms"] for h in self._history]
        return {
            "total_queries": len(self._history),
            "avg_latency_ms": float(np.mean(latencies)),
            "p95_latency_ms": float(np.percentile(latencies, 95)),
            "avg_citations": float(np.mean([h["num_citations"] for h in self._history])),
        }


_evaluator: Optional[RAGEvaluator] = None


def get_evaluator() -> RAGEvaluator:
    global _evaluator
    if _evaluator is None:
        _evaluator = RAGEvaluator()
    return _evaluator
