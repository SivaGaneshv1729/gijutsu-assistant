# MEI Platform - Technical Documentation

This document serves as the complete technical manual for the Manufacturing Engineering Intelligence (MEI) v3.0 Platform.



---

## QUICKSTART

# Setup & Installation

This guide walks through launching the full MEI platform on a local machine.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Docker Desktop | latest | Must be running for database infrastructure |
| Java JDK | 17+ | Used by the Spring Boot backend |
| Python | 3.10+ | Used by the AI service and ingestion pipeline |
| Node.js | 18+ | Used by the frontend |
| Ollama | latest | Local LLM inference (no API keys needed) |

> The backend ships an embedded Maven (3.9.6) under `backend/maven/`, so a separate Maven install is not required.

## Step 1 — Start the databases + Ollama

Open Docker Desktop, then from the project root:

```powershell
docker-compose up -d
```

This starts four containers:

- **PostgreSQL + pgvector** on host port `5433` (database `mei_platform`)
- **OpenSearch** on `9200`
- **Neo4j** on `7474` / `7687`
- **Ollama** on `11434`

Verify all containers are healthy:

```powershell
docker-compose ps
```

## Step 2 — Pull a local LLM model

Once Ollama is running, pull a model:

```powershell
docker exec -it manufacturing-engineering-intelligence-ollama-1 ollama pull mistral
```

Other good options: `llama3.1`, `phi3`, `gemma2`. The model runs entirely on your machine — zero API cost.

## Step 3 — Apply the database migrations

The migrations create the `pgvector` extension, tables, and indexes:

```powershell
Get-ChildItem database\migrations\*.sql | ForEach-Object {
  Get-Content $_.FullName | docker exec -i manufacturing-engineering-intelligence-postgres-1 psql -U postgres -d mei_platform
}
```

You should see `CREATE EXTENSION`, `CREATE TABLE`, and `CREATE INDEX` confirmations.

## Step 4 — Ingest the knowledge base

The ingestion pipeline parses PDF, DOCX, and HTML files into semantically chunked, vectorized entries.

```powershell
# Prepare the environment (first time only)
python -m venv venv_ingest
.\venv_ingest\Scripts\activate
pip install -r ingestion\requirements.txt

# Run the pipeline over the public knowledge base
python ingestion\pipeline.py knowledge-base\public
```

Notes:

- Place new manuals inside `knowledge-base/public/` (or any directory) and re-run.
- The pipeline **skips** documents that were already ingested (matched by filename).
- A second CLI argument sets the access level for ingested documents: `python ingestion\pipeline.py <dir> engineer`.

## Step 5 — Start the AI engine

```powershell
cd ai-service
python -m venv venv        # first time only
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The AI service:

- Loads the `all-MiniLM-L6-v2` embedding model on startup.
- Maintains an async PostgreSQL connection pool.
- Generates answers via the local Ollama LLM — no external API calls.

## Step 6 — Start the API gateway

```powershell
cd backend
maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

On first startup the gateway:

- Creates/updates the `users` table (JPA).
- Seeds four default accounts (see below) unless `SEED_DEFAULT_USERS=false`.

| Username | Password | Role |
|----------|----------|------|
| `admin` | `password123` | ADMIN |
| `engineer` | `password123` | ENGINEER |
| `manager` | `password123` | MANAGER |
| `operator` | `password123` | OPERATOR |

## Step 7 — Start the frontend

```powershell
cd frontend
npm install      # first time only
npm run dev
```

Open **http://localhost:4000**.

The Vite dev server proxies all `/api` calls to `http://localhost:8080`, so the backend, AI service, and databases must be running (or use the `demo` / `demo` login to preview the UI only).

## Dashboard of checks

After all services are up:

1. `http://localhost:8080/actuator/health` → `{"status":"UP"}`
2. `http://localhost:8000/health` → `{"status":"ok"}`
3. `http://localhost:4000` → log in as `engineer` / `password123`
4. Ask *"What is alarm E101?"* → expect an answer with source citations
5. Settings page → "Check health now" → all services online


---

## ENVIRONMENT VARIABLES

# Environment Variables

Every configuration option, grouped by service. All variables have sensible defaults and are optional unless marked otherwise.

## Root — Docker Compose (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `postgres` | PostgreSQL superuser |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `OPENSEARCH_PASSWORD` | `StrongPassword123!` | OpenSearch admin password (container) |
| `NEO4J_USER` | `neo4j` | Neo4j user |
| `NEO4J_PASSWORD` | `password` | Neo4j password |

Example: `POSTGRES_URL=jdbc:postgresql://localhost:5433/mei_platform`

## Backend — Spring Boot (from `.env`, OS env, or JVM args)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_URL` | `jdbc:postgresql://localhost:5433/mei_platform` | JDBC connection URL |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | (dev default) | HS256 signing key. **Override in production.** |
| `AI_SERVICE_URL` | `http://127.0.0.1:8000` | Base URL of the AI engine |
| `SEED_DEFAULT_USERS` | `true` | Seed `admin`/`engineer`/`manager`/`operator` on empty DB |

## AI Service — Python (from `ai-service/.env`, or OS env)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_HOST` | `localhost` | Database host |
| `POSTGRES_PORT` | `5433` | Database port |
| `POSTGRES_DB` | `mei_platform` | Database name |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `DB_POOL_MIN` | `1` | Minimum asyncpg pool connections |
| `DB_POOL_MAX` | `10` | Maximum asyncpg pool connections |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | sentence-transformers embedding model (384-dim) |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API base URL |
| `OLLAMA_MODEL` | `mistral` | Local LLM model to use |
| `USE_LLM` | `true` | Set `false` to force extractive answers |
| `RAG_TOP_K` | `5` | Number of chunks retrieved per query |
| `RERANK_ENABLED` | `true` | Enable cross-encoder reranking |
| `RERANK_MODEL` | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Cross-encoder model for reranking |
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j connection URI |
| `NEO4J_USER` | `neo4j` | Neo4j user |
| `NEO4J_PASSWORD` | `password` | Neo4j password |

## Ingestion — Python

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5433` | Database port |
| `DB_NAME` | `mei_platform` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `DEFAULT_ACCESS_LEVEL` | `public` | Access level stamped on ingested documents |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Embedding model |

## Frontend — Vite (in `frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DEMO_MODE` | `true` | `false` removes the `demo`/`demo` login bypass |
| `VITE_LLM_MODEL` | `Mistral (local Ollama)` | Display label on the Settings page |

## Production checklist

- Set a long random `JWT_SECRET` (e.g. a 256-bit base64 value).
- Set `SEED_DEFAULT_USERS=false` and remove/rotate default passwords.
- Set a strong `POSTGRES_PASSWORD` and `OPENSEARCH_PASSWORD`.
- Set `VITE_DEMO_MODE=false`.
- Pull an Ollama model on the host: `ollama pull mistral`.


---

## TROUBLESHOOTING

# Troubleshooting

Common issues and how to resolve them.

## Databases won't start

```
ERROR: ... port is already allocated
```

- PostgreSQL is mapped to `5433` on purpose. If that port is busy, either stop the conflicting process or change the mapping in `docker-compose.yml`.

```
OpenSearch: bootstrap checks failed
```

- OpenSearch needs a raised memory limit on Docker Desktop. Enable **Settings → Resources → Memory** (recommend 4 GB+). On Linux, raise `vm.max_map_count` (`sudo sysctl -w vm.max_map_count=262144`).

## Login returns "Invalid credentials"

- The four seed accounts are only created on an **empty** `users` table. If the table already has rows, no seeds are added.
- Wait for the backend to finish starting (`/actuator/health` returns UP) before logging in.
- Reset everything:
  ```powershell
  docker-compose down -v   # deletes volumes
  docker-compose up -d
  ```

## "The intelligence engine is currently unavailable"

- The AI service is not running on `:8000`. Start it:
  ```powershell
  cd ai-service; .\venv\Scripts\activate; uvicorn app.main:app --port 8000
  ```
- Wrong host. If the backend cannot reach `127.0.0.1:8000`, set `AI_SERVICE_URL` (e.g. container DNS name in a compose deployment).

## "I could not find any relevant information"

- The knowledge base is empty. Run the ingestion pipeline against a directory that contains files:
  ```powershell
  .\venv_ingest\Scripts\activate
  python ingestion\pipeline.py knowledge-base\public
  ```
- The ingested documents' `access_level` does not match your role (case-insensitive `PUBLIC` documents are visible to all, otherwise the document `access_level` must equal your role, e.g. `ENGINEER`).
- Ask with more specific wording (model numbers, alarm codes).

## The vector search is slow

- Confirm migration `V2__add_indexes.sql` was applied (adds the HNSW index + lookup indexes):
  ```powershell
  docker exec -it manufacturing-engineering-intelligence-postgres-1 psql -U postgres -d mei_platform -c "\di"
  ```
  You should see `idx_document_chunks_embedding`.

## LLM answers look like raw document text

- Ollama is not running or the model is not pulled. Check:
  ```powershell
  docker exec -it manufacturing-engineering-intelligence-ollama-1 ollama list
  ```
  If empty, pull a model: `docker exec -it manufacturing-engineering-intelligence-ollama-1 ollama pull mistral`
- Set `USE_LLM=false` to force extractive answers (top chunk only).

## Frontend preview works but every action fails

- You are almost certainly in **demo mode** (`demo`/`demo`). Demo mode stores a fake token and does not call the backend. Log in with a real account instead, or set `VITE_DEMO_MODE=false`.

## Backend reports a UUID/type conversion error on start

- Apply migrations with a clean database. JPA creates the `users` table; migrations create `documents`/`document_chunks`. Do not apply one without the other on a stale volume:
  ```powershell
  docker-compose down -v
  docker-compose up -d
  ```

## Port 4000 in use

```powershell
cd frontend
# change the port in vite.config.ts (server.port) or:
npx vite --port 4100
```

## Neo4j connection errors

- Neo4j may take 30+ seconds to start. Wait for the health check to pass:
  ```powershell
  docker-compose ps
  ```
- The knowledge graph features are optional. The platform works without Neo4j — graph features gracefully degrade.


---

## API

# API Reference

Base URLs:

- **API Gateway:** `http://localhost:8080`
- **AI Service (internal):** `http://localhost:8000`

Authentication: protected endpoints require `Authorization: Bearer <token>` (obtained from `POST /api/auth/login` or `/api/auth/register`).

---

## Gateway — Authentication

### `POST /api/auth/register`
Create an account. **The role is always `OPERATOR`** — any supplied role is ignored.

Request:
```json
{ "username": "sara", "email": "sara@mei.local", "password": "secret123" }
```

Responses:
- `200 OK` → `{ "token": "eyJhbGciOiJIUzI1NiJ9..." }`
- `400 Bad Request` → `{ "error": "Username or email is already taken" }`

PowerShell:
```powershell
$body = @{ username = "sara"; email = "sara@mei.local"; password = "secret123" } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8080/api/auth/register -Method Post -ContentType "application/json" -Body $body
```

### `POST /api/auth/login`
Request:
```json
{ "username": "engineer", "password": "password123" }
```
- `200 OK` → `{ "token": "eyJhbGciOiJIUzI1NiJ9..." }`
- `401 Unauthorized` on bad credentials.

### `GET /api/auth/me`
Returns the signed-in user. Requires bearer token.
- `200 OK` → `{ "username": "engineer", "role": "ENGINEER" }`

---

## Gateway — RAG Query

### `POST /api/rag/query`
Forwards a question to the AI engine with the caller's role as `access_level`. Requires bearer token.

Request:
```json
{ "query": "What is alarm E101?" }
```

Response (`200 OK`):
```json
{
  "data": {
    "answer": "Alarm E101 indicates an injection pressure fault...",
    "citations": [
      {
        "id": "0e0e...",
        "text_content": "Alarm E101 indicates an injection pressure fault...",
        "name": "Injection_Molding_Troubleshooting.pdf",
        "access_level": "public"
      }
    ]
  }
}
```

Notes:
- If the AI engine is unreachable, `data.error` is populated and `answer` explains the outage.
- `401/403` responses cause the frontend to log the user out.

---

## Gateway — Knowledge Base

### `GET /api/knowledge/documents`
Lists ingested documents with chunk counts. Requires bearer token.

Response (`200 OK`):
```json
[
  {
    "id": "2f3c7b4e-...",
    "name": "Injection_Molding_Troubleshooting.pdf",
    "type": "pdf",
    "accessLevel": "public",
    "createdAt": "2026-01-15T10:30:00",
    "chunkCount": 42
  }
]
```

### `DELETE /api/knowledge/documents/{id}`
Deletes a document and (via cascade) all its chunks. Requires bearer token.

Response (`200 OK`): `{ "deleted": true }`

---

## Gateway — System & Health

### `GET /api/system/health`
Database connectivity. Requires bearer token.
- `200 OK` → `{ "status": "UP", "database": true }`
- `200 OK` → `{ "status": "DOWN", "database": false }`

### `GET /api/system/ai-health`
AI service availability. Requires bearer token.
- `200 OK` → `{ "status": "ok" }` or `{ "status": "down" }`

### `GET /actuator/health`
Public Spring Boot health. Also exposes `info` and `metrics`.
- `200 OK` → `{ "status": "UP" }`

---

## AI Service (Internal)

### `GET /health`
- `200 OK` → `{"status": "ok"}`

### `POST /api/rag/query`
Internal retrieval + answer endpoint, normally called only by the gateway. Does its own RBAC filtering.

Request:
```json
{
  "query": "What is alarm E101?",
  "access_level": "ENGINEER"
}
```

Response (`200 OK`):
```json
{
  "answer": "### Summary\nBased on the engineering knowledge base, here is the information related to: **What is alarm E101?**\n\n### Details / Steps\n...",
  "citations": [
    {
      "id": "0e0e...",
      "text_content": "...",
      "name": "Injection_Molding_Troubleshooting.pdf",
      "access_level": "public"
    }
  ],
  "confidence": "High"
}
```

Behavior:
- Embeds the query with `all-MiniLM-L6-v2`, searches pgvector, filtering on `access_level`.
- Generates a fully formatted markdown answer using a custom internal string parsing summarizer, completely bypassing external or local LLMs like Ollama.
- Validation failure (empty query) → `422 Unprocessable Entity`.

### `POST /api/rag/ingest`
Internal document ingestion endpoint called by the Gateway when a new file is uploaded.

Request:
```json
{
  "filename": "uuid-1234.pdf",
  "original_filename": "Manual.pdf",
  "access_level": "ADMIN"
}
```

Response (`200 OK`):
```json
{
  "status": "success",
  "chunks_processed": 15
}
```

Behavior:
- Reads the file from the shared Docker `/app/uploads` volume.
- Extracts text using PyMuPDF (`fitz`).
- Semantically chunks the text and embeds it using `all-MiniLM-L6-v2`.
- Inserts chunks into the Postgres `document_chunks` table for future retrieval.

### `GET /api/v1/llm/health`
Check if Ollama is reachable.
- `200 OK` → `{"status": "ok", "provider": "ollama"}`

### `GET /api/v1/llm/models`
List available Ollama models.
- `200 OK` → `{"models": ["mistral", "llama3.1", ...]}`

### `GET /api/v1/graph/stats`
Neo4j knowledge graph statistics (nodes + relationships).
- `200 OK` → `{"documents": 5, "entities": 42, "chunks": 210, "relationships": 156}`

### `GET /api/v1/graph/related?doc_name=...`
Find documents related through shared entities.
- `200 OK` → `{"related_documents": [...]}`

### `GET /api/v1/graph/entity?entity=...`
Get all documents mentioning a specific entity.
- `200 OK` → `{"documents": [...]}`

### `GET /api/v1/evaluation/summary`
Query performance metrics (latency, citation density).
- `200 OK` → `{"total_queries": 15, "avg_latency_ms": 1200, ...}`

### `GET /api/v1/evaluation/history?limit=50`
Recent query history.
- `200 OK` → `{"history": [...]}`

### `GET /api/v1/embeddings/info`
Embedding model details.
- `200 OK` → `{"model": "all-MiniLM-L6-v2", "dimension": 384, "provider": "sentence-transformers (local)"}`

---

## Status codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad request (e.g. duplicate registration) |
| `401` | Missing/invalid/expired JWT |
| `403` | Authenticated but forbidden |
| `404` | Resource not found |
| `422` | Validation failure (FastAPI) |
| `500` | Unexpected server error |

---

## DATA MODEL

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

---

## SECURITY

# Security Model

## Authentication — JWT

- Users authenticate via `POST /api/auth/login` and receive an HS256-signed JWT.
- The token is stored in the browser's `localStorage` and sent as `Authorization: Bearer <token>`.
- A `JwtAuthenticationFilter` validates the token on every request and populates the Spring `SecurityContext`.
- Sessions are stateless; CSRF is disabled (no cookies are used).
- Token lifetime defaults to 24 hours (`jwt.expiration` ms).
- `GET /api/auth/me` lets the client discover the signed-in user and role.

## Authorization — Role-Based Access Control (RBAC)

Five roles, in increasing privilege:

```
OPERATOR < ENGINEER < MAINTENANCE_ENGINEER < MANAGER < ADMIN
```

The `Role` is mapped to the Spring authority `ROLE_<NAME>` and to the `access_level` field passed to the AI engine.

### Enforcement points

| Layer | Enforcement |
|-------|-------------|
| Frontend | Route guard requires a token in `localStorage` |
| Backend | Any request to `/api/**` except `/api/auth/**` and `/actuator/health` requires a valid JWT |
| AI Service | Retrieval SQL filters chunks by `access_level` of both the document and the caller (see below) |

### RBAC-before-retrieval

Authorization happens **inside** the vector query, not after it — documents are only candidates if:

```text
UPPER(documents.access_level) = 'PUBLIC'
   OR UPPER(documents.access_level) = UPPER(caller_role)
```

This guarantees an authorized user receives top-K results and an unauthorized user never receives restricted content (ADR-005).

## Role assignment

- **Self-registration is restricted to `OPERATOR`** regardless of any role supplied in the request body (`AuthService`). Higher roles are provisioned only by the startup seed or direct database writes.
- On an empty `users` table, the backend seeds `admin`, `engineer`, `manager`, `operator` (all `password123`). Disable with `SEED_DEFAULT_USERS=false` for production.

## Known limitations & recommendations

| Area | Limitation | Recommendation |
|------|-----------|----------------|
| Token storage | `localStorage` is XSS-accessible | Move to `HttpOnly`+`Secure` cookies or a BFF proxy for hardened deployments |
| Seed passwords | Default credentials are publicly known | Change or disable seed users outside development |
| JWT secret | A dev default is baked into `application.yml` | Always set `JWT_SECRET` to a long random value |
| Data in transit | Plain HTTP in local dev | Terminate behind TLS in production |
| Rate limiting | None on `/api/auth/login` | Add login throttling / lockout in production |
| Audit logging | Not implemented | Log auth and document delete events for compliance |

## Threat model summary

- **Unauthorized API access** — prevented by JWT validation on every protected route.
- **Privilege escalation** — prevented by forcing `OPERATOR` on self-registration.
- **Data leakage via retrieval** — prevented by RBAC filter inside the ANN query; LLM prompt only ever contains retrieved (authorized) chunks.
- **Prompt injection** — mitigated by instructing the model to answer only from the provided context; document text is untrusted input, so a stricter classifier may be warranted for hostile knowledge bases.