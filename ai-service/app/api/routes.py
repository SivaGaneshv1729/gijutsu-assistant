from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.rag.retriever import retrieve_and_answer

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
    citations: list[Citation]


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/api/v1/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    result = await retrieve_and_answer(request.query, request.access_level)
    return result