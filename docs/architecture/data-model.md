# Data Model

The platform uses a single PostgreSQL 15 database (`mei_platform`) with the `pgvector` extension. Tables are created by SQL migrations except `users`, which is managed by JPA (`ddl-auto: update`).

## Tables

### `users`

Managed by the Spring Boot backend (JPA). Stores authentication accounts.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `username` | VARCHAR | Unique, not null |
| `email` | VARCHAR | Unique, not null |
| `password` | VARCHAR | BCrypt hash, not null |
| `role` | VARCHAR | One of: `OPERATOR`, `ENGINEER`, `MAINTENANCE_ENGINEER`, `MANAGER`, `ADMIN` |
| `created_at` | TIMESTAMP | Set on persist |
| `updated_at` | TIMESTAMP | Set on persist/update |

### `documents`

Created by `V1__init_schema.sql`. Represents an ingested source file.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, `gen_random_uuid()` |
| `name` | VARCHAR | Filename, e.g. `Injection_Molding_Troubleshooting.pdf` |
| `type` | VARCHAR | Source extension, e.g. `pdf`, `docx`, `html` |
| `access_level` | VARCHAR | RBAC level, e.g. `public` or a role name |
| `created_at` | TIMESTAMP | Defaults to now |

### `document_chunks`

Created by `V1__init_schema.sql`. One row per semantic chunk of a document.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `document_id` | UUID | FK → `documents.id`, `ON DELETE CASCADE` |
| `text_content` | TEXT | The chunk text |
| `embedding` | vector(384) | pgvector embedding from `all-MiniLM-L6-v2` |

## Relationships

```text
users (1)      documents (1) ──── (N) document_chunks
                    │                    │
                    │ access_level       │ embedding (vector 384)
                    │                    │ document_id (FK, cascade delete)
                    └──── name/type ─────┘
```

- Deleting a document cascades to all of its chunks.

## Indexes (migration `V2__add_indexes.sql`)

| Index | Purpose |
|-------|---------|
| `idx_document_chunks_embedding` | HNSW (L2) approximate nearest-neighbor search |
| `idx_documents_access_level` | Fast RBAC filtering in retrieval queries |
| `idx_document_chunks_document_id` | FK join performance |
| `idx_documents_created_at` | Ordering listings by recency |

## Why embeddings are stored next to metadata

Storing vectors and relational metadata in one database enables **filtering during retrieval** (see ADR-003 and ADR-005):

```sql
SELECT dc.id, dc.text_content, d.name, d.access_level
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
WHERE UPPER(d.access_level) = 'PUBLIC'
   OR UPPER(d.access_level) = UPPER($2)          -- caller's role
ORDER BY dc.embedding <-> $1                      -- L2 distance to query embedding
LIMIT $3;
```

The caller's role is injected by the gateway from the JWT and passed as `access_level` to the AI service, preventing unauthorized content from ever entering the result set.

## Document lifecycle

1. File placed in a folder (e.g. `knowledge-base/public/`).
2. Ingestion pipeline parses it (PDF/DOCX/HTML) → creates chunks (∼500 tokens, 50-token overlap).
3. Chunks are embedded (384-dim) and batch-inserted.
4. Retrieval queries rank chunks by vector distance with RBAC filtering.
5. `DELETE` from the UI removes the document and its chunks (cascade).