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
