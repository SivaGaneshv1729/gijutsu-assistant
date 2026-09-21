import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as rag_router
from app.rag.database import init_db
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="SHIBAURA Engineering Intelligence AI Service",
    description="AI backend for Hybrid RAG, Embeddings, and Graph retrieval",
    version="1.0.0"
)

# Allow CORS only for known origins (Vite dev / API gateway). Wildcard +
# allow_credentials is invalid per the CORS spec and disables credentialed requests.
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:4000,http://127.0.0.1:4000,http://localhost:8080"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("/app/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

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