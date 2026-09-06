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
