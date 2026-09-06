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

### `POST /api/v1/query`
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
  "answer": "Alarm E101 indicates an injection pressure fault...",
  "citations": [
    {
      "id": "0e0e...",
      "text_content": "...",
      "name": "Injection_Molding_Troubleshooting.pdf",
      "access_level": "public"
    }
  ]
}
```

Behavior:
- Embeds the query with `all-MiniLM-L6-v2`, searches pgvector, filtering on `access_level`.
- Answers via the local Ollama LLM (`mistral` by default). Without Ollama running, returns the top matched chunk (extractive fallback).
- Validation failure (empty query) → `422 Unprocessable Entity`.

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