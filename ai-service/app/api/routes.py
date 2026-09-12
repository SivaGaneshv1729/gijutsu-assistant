from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.rag.database import get_db
from app.rag.orchestrator import RAGOrchestrator

router = APIRouter()

class QueryRequest(BaseModel):
    query: str
    language: str = "en"

class QueryResponse(BaseModel):
    answer: str
    citations: list
    confidence: str

@router.post("/query", response_model=QueryResponse)
def handle_query(request: QueryRequest, db: Session = Depends(get_db)):
    try:
        orchestrator = RAGOrchestrator(db)
        result = orchestrator.query(request.query)
        return QueryResponse(
            answer=result["answer"],
            citations=result["citations"],
            confidence=result["confidence"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
