from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class DocumentMetadata(BaseModel):
    document_id: str
    document_name: str
    document_type: str
    product_category: Optional[str] = None
    machine_type: Optional[str] = None
    component: Optional[str] = None
    language: str = "en"
    version: str = "1.0"
    source_url: Optional[str] = None
    access_level: str = "PUBLIC"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    checksum: str

class ChunkMetadata(BaseModel):
    chunk_id: str
    document_id: str
    page_number: Optional[int] = None
    section: Optional[str] = None
    source_url: Optional[str] = None
    version: str
    access_level: str

class DocumentChunk(BaseModel):
    content: str
    metadata: ChunkMetadata
