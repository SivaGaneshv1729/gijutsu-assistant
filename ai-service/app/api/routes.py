import traceback
from fastapi import APIRouter, Depends, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
import os
import uuid
import fitz # PyMuPDF
from app.rag.database import get_db, DocumentChunkModel
from app.rag.orchestrator import RAGOrchestrator
from app.embeddings.generator import embedding_generator

router = APIRouter()

MAX_QUERY_LENGTH = 2000


class QueryRequest(BaseModel):
    query: str = Field(min_length=1, max_length=MAX_QUERY_LENGTH)
    access_level: Optional[str] = "ENGINEER"
    language: str = "en"
    session_id: str
    document_ids: Optional[List[str]] = None


class Citation(BaseModel):
    id: str
    text_content: str
    name: Optional[str] = None
    access_level: Optional[str] = None
    rrf_score: Optional[float] = None
    image_url: Optional[str] = None
    page_number: Optional[int] = None


class QueryResponse(BaseModel):
    answer: str
    citations: List[Citation]
    confidence: str


class IngestRequest(BaseModel):
    filename: str
    original_filename: str
    access_level: Optional[str] = "ENGINEER"


@router.get("/images/{filename}")
def get_image(filename: str):
    """Serve extracted PDF images for the chat UI."""
    file_path = os.path.join("/app/uploads/images", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)


@router.post("/query", response_model=QueryResponse)
def query_rag(request: QueryRequest, db: Session = Depends(get_db)):
    try:
        orchestrator = RAGOrchestrator(db)
        result = orchestrator.query(
            user_question=request.query,
            access_level=request.access_level,
            language=request.language,
            session_id=request.session_id,
            document_ids=request.document_ids
        )
        return result
    except Exception as e:
        print("Error processing query:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error while processing query.")


@router.post("/ingest")
def ingest_document(request: IngestRequest, db: Session = Depends(get_db)):
    try:
        file_path = os.path.join("/app/uploads", request.filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
            
        images_dir = "/app/uploads/images"
        os.makedirs(images_dir, exist_ok=True)
            
        chunks = []
        # Basic parsing using PyMuPDF for PDFs
        if request.filename.lower().endswith(".pdf"):
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()
                
                # Extract images from page
                image_url = None
                image_list = page.get_images()
                if image_list:
                    # Just take the first significant image on the page
                    for img in image_list:
                        xref = img[0]
                        pix = fitz.Pixmap(doc, xref)
                        
                        # Convert to standard RGB if needed
                        if pix.n - pix.alpha > 3:
                            pix = fitz.Pixmap(fitz.csRGB, pix)
                            
                        # Save the image
                        img_filename = f"{request.original_filename}_p{page_num}_{xref}.png"
                        img_path = os.path.join(images_dir, img_filename)
                        pix.save(img_path)
                        pix = None # free memory
                        
                        image_url = f"/api/rag/images/{img_filename}"
                        break # Only associate one image per page chunk

                if not text.strip():
                    if image_url:
                        # If page has only an image and no text, we still want to keep the image!
                        chunks.append({"page_number": page_num + 1, "text": f"[Image on page {page_num+1}]", "image_url": image_url})
                    continue
                    
                # Split text into rough chunks of ~1000 characters
                words = text.split()
                chunk_words = []
                for word in words:
                    chunk_words.append(word)
                    if len(" ".join(chunk_words)) > 1000:
                        chunks.append({"page_number": page_num + 1, "text": " ".join(chunk_words), "image_url": image_url})
                        chunk_words = []
                        image_url = None # Only attach image to the first chunk of the page
                if chunk_words:
                    chunks.append({"page_number": page_num + 1, "text": " ".join(chunk_words), "image_url": image_url})
        elif request.filename.lower().endswith((".md", ".txt")):
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
                
            words = text.split()
            chunk_words = []
            chunk_index = 1
            for word in words:
                chunk_words.append(word)
                if len(" ".join(chunk_words)) > 1000:
                    chunks.append({"page_number": chunk_index, "text": " ".join(chunk_words)})
                    chunk_index += 1
                    chunk_words = []
            if chunk_words:
                chunks.append({"page_number": chunk_index, "text": " ".join(chunk_words)})
        else:
            # Fallback for unhandled types
            return {"status": "success", "message": "Non-PDF/MD file saved. RAG indexing skipped."}
            
        if not chunks:
            return {"status": "success", "message": "No text extracted from document."}

        from sqlalchemy import text

        # Ensure the parent document exists to satisfy foreign key constraints created by the Java backend
        db.execute(
            text("INSERT INTO documents (id, name, type, access_level, created_at) VALUES (:id, :name, 'MANUAL', :access_level, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING"),
            {"id": request.original_filename, "name": request.filename, "access_level": request.access_level.upper() if request.access_level else "ADMIN"}
        )
        db.commit()

        # Generate embeddings and save to DB
        db_chunks = []
        for i, chunk in enumerate(chunks):
            embedding = embedding_generator.generate(chunk["text"])
            
            metadata = {"source": request.original_filename}
            if chunk.get("image_url"):
                metadata["image_url"] = chunk["image_url"]
                
            db_chunk = DocumentChunkModel(
                id=str(uuid.uuid4()),
                document_id=request.original_filename,
                content=chunk["text"],
                page_number=chunk["page_number"],
                section=f"Page {chunk['page_number']}",
                access_level=request.access_level.upper() if request.access_level else "ADMIN",
                metadata_json=metadata,
                embedding=embedding
            )
            db.add(db_chunk)
            
            # Commit in batches of 10 to avoid excessive memory usage and OOM crashes
            if (i + 1) % 10 == 0:
                db.commit()
                
        db.commit()
        return {"status": "success", "chunks_processed": len(chunks)}
    except HTTPException:
        raise  # Re-raise HTTP exceptions (e.g., 404) as-is
    except Exception as e:
        print("Error ingesting document:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

from app.graph.neo4j_store import get_knowledge_graph

@router.get("/graph")
async def get_graph():
    try:
        kg = await get_knowledge_graph()
        return await kg.export_graph()
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
