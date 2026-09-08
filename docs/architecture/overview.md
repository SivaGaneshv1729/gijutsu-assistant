# Architecture Overview

The MEI platform is a microservices-style application with a clear separation between enterprise logic, AI/ML logic, and infrastructure.

```text
                         ┌──────────────────┐
                         │   Frontend       │  React + Vite   (port 4000)
                         │   Web UI         │
                         └────────┬─────────┘
                                  │  /api/*  (proxied by Vite in dev)
                                  ▼
                         ┌──────────────────┐
                         │  API Gateway     │  Java / Spring Boot  (port 8080)
                         │  Auth + RBAC     │
                         │  Orchestration   │
                         └───┬──────┬───────┘
                             │      │
              JWT / users    │      │  POST /api/v1/query (query + access_level)
                             │      ▼
                             │  ┌──────────────────┐
                             │  │   AI Engine      │  Python / FastAPI  (port 8000)
                             │  │   embed + search │
                             │  │   answer (LLM)   │
                             │  └──┬─────┬────┬────┘
                             │     │     │    │
                             │     │     │    └── Ollama (port 11434) — local LLM
                             │     │     └── Neo4j (port 7687) — knowledge graph
                             │     │  pgvector query (L2 distance, RBAC filter)
                             ▼     ▼
                   ┌────────────────────────────┐
                   │  PostgreSQL 15 + pgvector  │  (port 5433)
                   │  users · documents ·       │
                   │  chunks(embedding vector)  │
                   └────────────────────────────┘

   Ingestion CLI (separate process) ───────────────────▶ PostgreSQL
   reads knowledge-base documents, chunks & embeds them
```

## Request paths

### Chat query (end-to-end)

```text
User question
   │
   ▼
POST /api/rag/query                     frontend → gateway (JWT in Authorization header)
   │  gateway extracts caller role from SecurityContext → access_level
   ▼
POST /api/v1/query {query, access_level}   gateway → AI service
   │  1. embed query with all-MiniLM-L6-v2 (384-dim)
   │  2. pgvector query: WHERE access_level matches ORDER BY embedding <-> $1 LIMIT 5
   │  3. (optional) cross-encoder rerank for precision
   │  4. build prompt: context + question
   │  5. call local Ollama LLM (or extractive fallback)
   ▼
{answer, citations[]}  →  gateway wraps in {data: {...}}  →  frontend renders
```

### Login / registration

```text
POST /api/auth/login   →   AuthenticationManager → JWT token → stored in localStorage
POST /api/auth/register →  always creates OPERATOR → JWT token
GET  /api/auth/me      →  {username, role} for the Settings page
```

### Knowledge management

```text
GET  /api/knowledge/documents          → list of {id, name, type, accessLevel, createdAt, chunkCount}
DELETE /api/knowledge/documents/{id}   → removes document + cascades to chunks
```

### Health checks

```text
GET /actuator/health     → public, Spring Boot actuator
GET /api/system/health   → gateway → {status, database}
GET /api/system/ai-health→ gateway → AI service /health → {status}
GET /health              → AI service liveness
GET /api/v1/llm/health   → AI service → Ollama connectivity
```

## Infrastructure

- **PostgreSQL + pgvector (5433)**: Vector storage, document metadata, RBAC filtering.
- **Ollama (11434)**: Local LLM inference. No API keys, no external billing. Pull a model with `ollama pull mistral`.
- **Neo4j (7474/7687)**: Knowledge graph for entity relationships, document linking, and related-document discovery.
- **OpenSearch (9200)**: Hybrid BM25 keyword search (optional, reserved for future use).

## Deployment notes

- Each service is independently replaceable/scalable.
- The frontend, gateway, and AI service can be containerized using standard images; `docker-compose.yml` provisions all databases + Ollama.
- SQL migrations are applied manually (see `docs/setup/quickstart.md`) and must be run before starting the backend so the `documents` tables exist.
