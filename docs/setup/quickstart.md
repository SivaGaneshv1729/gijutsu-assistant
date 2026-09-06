# Setup & Installation

This guide walks through launching the full MEI platform on a local machine.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Docker Desktop | latest | Must be running for database infrastructure |
| Java JDK | 17+ | Used by the Spring Boot backend |
| Python | 3.10+ | Used by the AI service and ingestion pipeline |
| Node.js | 18+ | Used by the frontend |

> The backend ships an embedded Maven (3.9.6) under `backend/maven/`, so a separate Maven install is not required.

## Step 1 — Start the databases

Open Docker Desktop, then from the project root:

```powershell
docker-compose up -d
```

This starts three containers:

- **PostgreSQL + pgvector** on host port `5433` (database `mei_platform`)
- **OpenSearch** on `9200`
- **Neo4j** on `7474` / `7687`

Verify all containers are healthy:

```powershell
docker-compose ps
```

## Step 2 — Apply the database migrations

The migrations create the `pgvector` extension, tables, and indexes:

```powershell
Get-ChildItem database\migrations\*.sql | ForEach-Object {
  Get-Content $_.FullName | docker exec -i manufacturing-engineering-intelligence-postgres-1 psql -U postgres -d mei_platform
}
```

You should see `CREATE EXTENSION`, `CREATE TABLE`, and `CREATE INDEX` confirmations.

## Step 3 — Ingest the knowledge base

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

## Step 4 — Start the AI engine

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
- Generates answers with the free Hugging Face Inference API (see "Configure the LLM" below).

### Configure the LLM (free)

1. Create a free token at <https://huggingface.co/settings/tokens>.
2. Set it in the environment used by the AI service:

```powershell
$env:HF_TOKEN = "hf_..."
```

3. Restart the AI service.

Without a token the engine returns the top matching document chunk instead (extractive fallback), so the platform still works end-to-end.

## Step 5 — Start the API gateway

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

## Step 6 — Start the frontend

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
5. Settings page → "Check health now" → both services online