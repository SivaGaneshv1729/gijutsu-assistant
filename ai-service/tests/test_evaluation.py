from app.evaluation.metrics import RAGEvaluator


def test_retrieval_metrics_empty():
    evaluator = RAGEvaluator()
    metrics = evaluator.compute_retrieval_metrics("test", [])
    assert metrics["num_chunks_retrieved"] == 0


def test_retrieval_metrics_with_chunks():
    evaluator = RAGEvaluator()
    chunks = [
        {"text_content": "Alarm E101 indicates a pressure fault.", "name": "manual.pdf"},
        {"text_content": "Check the hydraulic valve.", "name": "sop.pdf"},
    ]
    metrics = evaluator.compute_retrieval_metrics("What is E101?", chunks)
    assert metrics["num_chunks_retrieved"] == 2
    assert metrics["unique_sources"] == 2
    assert metrics["avg_chunk_length"] > 0


def test_answer_metrics():
    evaluator = RAGEvaluator()
    citations = [{"name": "manual.pdf", "text_content": "Alarm E101..."}]
    metrics = evaluator.compute_answer_metrics("What is E101?", "Alarm E101 is a pressure fault.", citations)
    assert metrics["has_answer"] is True
    assert metrics["num_citations"] == 1
    assert "manual.pdf" in metrics["sources_used"]


def test_answer_metrics_empty_answer():
    evaluator = RAGEvaluator()
    metrics = evaluator.compute_answer_metrics("query", "", [])
    assert metrics["has_answer"] is False


def test_log_and_summary():
    evaluator = RAGEvaluator()
    evaluator.log_query("q1", "a1", [{"name": "doc.pdf"}], 100.0, "mistral")
    evaluator.log_query("q2", "a2", [{"name": "doc.pdf"}, {"name": "doc2.pdf"}], 200.0, "mistral")
    summary = evaluator.get_summary()
    assert summary["total_queries"] == 2
    assert summary["avg_latency_ms"] == 150.0
    assert summary["avg_citations"] == 1.5


def test_history_limit():
    evaluator = RAGEvaluator()
    for i in range(10):
        evaluator.log_query(f"q{i}", f"a{i}", [], 50.0, "test")
    history = evaluator.get_history(limit=3)
    assert len(history) == 3
