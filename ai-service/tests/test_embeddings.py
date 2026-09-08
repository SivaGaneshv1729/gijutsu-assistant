from app.embeddings.service import EmbeddingService


def test_embedding_service_returns_correct_dimension():
    svc = EmbeddingService()
    embedding = svc.embed_text("hello world")
    assert len(embedding) == 384


def test_embedding_service_batch():
    svc = EmbeddingService()
    embeddings = svc.embed_batch(["hello", "world", "test"])
    assert len(embeddings) == 3
    assert all(len(e) == 384 for e in embeddings)


def test_embedding_service_model_name():
    svc = EmbeddingService()
    assert svc.model_name == "all-MiniLM-L6-v2"


def test_embedding_service_dimension_property():
    svc = EmbeddingService()
    assert svc.dimension == 384


def test_embed_query_returns_same_as_embed_text():
    svc = EmbeddingService()
    q = svc.embed_query("test query")
    t = svc.embed_text("test query")
    assert q == t
