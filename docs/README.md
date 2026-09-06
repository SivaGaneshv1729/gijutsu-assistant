# MEI Platform Documentation

Welcome to the Manufacturing Engineering Intelligence (MEI) Platform documentation. This guide covers setup, architecture, API reference, security, and product demos.

## Documentation Index

| Section | Purpose |
|---------|---------|
| [Setup & Installation](setup/quickstart.md) | From zero to a running platform in a few commands |
| [Environment Variables](setup/environment-variables.md) | Every configuration option across all services |
| [Troubleshooting](setup/troubleshooting.md) | Common problems and their fixes |
| [Architecture Overview](architecture/overview.md) | Services, data flows, and request paths |
| [Data Model](architecture/data-model.md) | Database schema and how documents are stored |
| [Security Model](architecture/security.md) | JWT authentication, RBAC, and threat considerations |
| [API Reference](api/api.md) | All REST endpoints with request/response examples |
| [Demo Script](demo/demo-script.md) | A guided walkthrough of the product |
| [Architecture Decisions](decisions/) | Record of significant technical decisions (ADRs) |

## Service Map

| Service | Tech | Port | Purpose |
|---------|------|------|---------|
| Frontend | React + Vite + Tailwind | 4000 | Web UI |
| API Gateway | Java 17 + Spring Boot 3 | 8080 | Auth, RBAC, orchestration |
| AI Engine | Python + FastAPI | 8000 | Embeddings, retrieval, answer generation |
| PostgreSQL | PostgreSQL 15 + pgvector | 5433 (host) | Documents, chunks, users |
| OpenSearch | OpenSearch 2.11 | 9200 | Reserved for hybrid/BM25 retrieval |
| Neo4j | Neo4j 5.15 | 7474 / 7687 | Reserved for knowledge graph |

## Quick Start

```bash
# 1. Start infrastructure (Docker Desktop must be running)
docker-compose up -d

# 2. Apply database migrations
Get-ChildItem database\migrations\*.sql | ForEach-Object {
  Get-Content $_.FullName | docker exec -i manufacturing-engineering-intelligence-postgres-1 psql -U postgres -d mei_platform
}

# 3. Ingest the knowledge base
.\venv_ingest\Scripts\activate
pip install -r ingestion/requirements.txt
python ingestion\pipeline.py knowledge-base\public

# 4. Start the AI engine
cd ai-service
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 5. Start the API gateway
cd backend
maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run

# 6. Start the frontend
cd frontend
npm install
npm run dev
```

Open **http://localhost:4000** and log in with `engineer` / `password123`.