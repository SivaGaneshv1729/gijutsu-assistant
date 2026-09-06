-- V2: Performance and search indexes
-- HNSW approximate nearest-neighbour index for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
    ON document_chunks USING hnsw (embedding vector_l2_ops);

-- Lookup index on access_level for RBAC filtering
CREATE INDEX IF NOT EXISTS idx_documents_access_level
    ON documents (access_level);

-- Foreign-key lookup index
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id
    ON document_chunks (document_id);

-- Text search is often done from newest to oldest
CREATE INDEX IF NOT EXISTS idx_documents_created_at
    ON documents (created_at DESC);