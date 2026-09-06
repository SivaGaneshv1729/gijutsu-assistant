from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.rag.retriever import retrieve_and_answer
from app.graph.neo4j_store import get_knowledge_graph
from app.llm.client import check_ollama_health, list_models
from app.evaluation.metrics import get_evaluator
from app.embeddings.service import get_embedding_service

router = APIRouter()


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Natural language question")
    access_level: str = Field("PUBLIC", description="Caller's role for RBAC filtering")


class Citation(BaseModel):
    id: str
    text_content: str
    name: str
    access_level: str


class QueryResponse(BaseModel):
    answer: str
    citations: List[Citation]


class EntityCreateRequest(BaseModel):
    doc_id: str
    entities: List[dict]


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/api/v1/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    result = await retrieve_and_answer(request.query, request.access_level)
    return result


@router.get("/api/v1/llm/health")
async def llm_health():
    ok = await check_ollama_health()
    return {"status": "ok" if ok else "unavailable", "provider": "ollama"}


@router.get("/api/v1/llm/models")
async def llm_models():
    models = await list_models()
    return {"models": models}


@router.get("/api/v1/graph/stats")
async def graph_stats():
    kg = await get_knowledge_graph()
    try:
        stats = await kg.get_graph_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Neo4j unavailable: {e}")


@router.get("/api/v1/graph/related")
async def graph_related(doc_name: str = Query(..., description="Document name")):
    kg = await get_knowledge_graph()
    try:
        related = await kg.find_related_documents(doc_name)
        return {"related_documents": related}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Neo4j unavailable: {e}")


@router.get("/api/v1/graph/entity")
async def graph_entity(entity: str = Query(..., description="Entity name")):
    kg = await get_knowledge_graph()
    try:
        docs = await kg.get_entity_context(entity)
        return {"documents": docs}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Neo4j unavailable: {e}")


@router.get("/api/v1/evaluation/summary")
async def evaluation_summary():
    evaluator = get_evaluator()
    return evaluator.get_summary()


@router.get("/api/v1/evaluation/history")
async def evaluation_history(limit: int = Query(50, ge=1, le=200)):
    evaluator = get_evaluator()
    return {"history": evaluator.get_history(limit)}


@router.get("/api/v1/embeddings/info")
async def embeddings_info():
    svc = get_embedding_service()
    return {
        "model": svc.model_name,
        "dimension": svc.dimension,
        "provider": "sentence-transformers (local)",
    }
