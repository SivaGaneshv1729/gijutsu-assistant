from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as rag_router
from app.rag.database import init_db

app = FastAPI(
    title="SHIBAURA Engineering Intelligence AI Service",
    description="AI backend for Hybrid RAG, Embeddings, and Graph retrieval",
    version="1.0.0"
)

# Allow CORS for local development via API Gateway/Vite Proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional: Initialize DB schemas on startup if we are the owner
@app.on_event("startup")
def on_startup():
    try:
        init_db()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Warning: Database initialization failed (is Postgres running?): {e}")

app.include_router(rag_router, prefix="/api/rag", tags=["RAG"])

@app.get("/health")
def health_check():
    return {"status": "ok"}