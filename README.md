# Manufacturing Engineering Intelligence (MEI) Platform

An enterprise-grade Hybrid Retrieval-Augmented Generation (RAG) platform designed to assist manufacturing engineers and operators. The MEI Platform instantly surfaces technical manuals, SOPs, and machine alarm troubleshooting guides using advanced AI similarity search.

## 🏗️ Architecture overview

The platform is built on a modern microservices architecture:

1. **Frontend (`/frontend`)**: A React + Vite application styled with Tailwind CSS and Lucide React icons, running on port `4000`. Features an enterprise dashboard, JWT-based authentication, and a real-time AI chat interface.
2. **API Gateway (`/backend`)**: A Java Spring Boot application running on port `8080`. Acts as the primary entry point, handling JWT Security, Role-Based Access Control (RBAC), and proxying authorized queries to the AI Engine.
3. **AI Engine (`/ai-service`)**: A Python FastAPI application running on port `8000`. Uses HuggingFace's `sentence-transformers` (`all-MiniLM-L6-v2`) to embed user queries and execute vector math against the database.
4. **Ingestion Pipeline (`/ingestion`)**: A Python-based ETL pipeline that reads technical PDFs, semantically chunks them, generates 384-dimensional embeddings, and inserts them into PostgreSQL.
5. **Infrastructure (`docker-compose.yml`)**: Containerized databases including PostgreSQL (with `pgvector` enabled on port `5433`), OpenSearch, Neo4j, and **Ollama** (local LLM on port `11434`).

## 📁 Repository Structure

```text
manufacturing-engineering-intelligence/
├── ai-service/          # Python FastAPI (RAG Retrieval Engine)
├── backend/             # Java Spring Boot (Auth & API Gateway)
├── frontend/            # React + Vite (Web UI)
├── ingestion/           # Python (PDF Parsing & Vector Embedding)
├── database/            # SQL Migrations (pgvector schema)
├── knowledge-base/      # Raw technical manuals and PDFs (e.g., Shibaura E101)
├── docs/                # Setup, architecture, API reference, demo script, ADRs
├── docker-compose.yml   # Infrastructure orchestration
└── README.md            # Project documentation
```

## 📚 Documentation

Full documentation lives in [`docs/`](docs/README.md):

- [Setup & Quickstart](docs/setup/quickstart.md)
- [Environment Variables](docs/setup/environment-variables.md)
- [Troubleshooting](docs/setup/troubleshooting.md)
- [Architecture Overview](docs/architecture/overview.md)
- [Data Model](docs/architecture/data-model.md)
- [Security Model](docs/architecture/security.md)
- [API Reference](docs/api/api.md)
- [Demo Script](docs/demo/demo-script.md)
- [Architecture Decisions](docs/decisions/)

## ⚙️ Prerequisites

- **Docker Desktop** (Must be running for database infrastructure)
- **Java 17** (or use the embedded Maven wrapper)
- **Python 3.10+** (For AI Service and Ingestion)
- **Node.js 18+** (For Frontend)
- **Ollama** (Included in Docker Compose — local LLM, zero cost)

## 🚀 Setup & Installation

### 1. Start the Databases
Open Docker Desktop, then run the following in the project root:
```bash
docker-compose up -d
```
*Note: Postgres is mapped to `localhost:5433` to prevent conflicts with other local databases. Ollama runs on `localhost:11434`.*

### 2. Pull a Local LLM Model
```bash
docker exec -it manufacturing-engineering-intelligence-ollama-1 ollama pull mistral
```
*This runs entirely on your machine — no API keys, no external billing, zero cost.*

### 3. Initialize the Database Schema
Apply the SQL migration to create the `pgvector` extension and the necessary tables:
```bash
Get-Content database\migrations\V1__init_schema.sql | docker exec -i manufacturing-engineering-intelligence-postgres-1 psql -U postgres -d mei_platform
```

### 4. Run the Ingestion Pipeline
To populate the database with technical manuals (e.g., the E101 Alarm guide and any PDF/DOCX/HTML you add):
```bash
# In the project root
python -m venv venv_ingest
.\venv_ingest\Scripts\activate
pip install -r ingestion/requirements.txt
python ingestion/pipeline.py knowledge-base/public
```
The pipeline parses `.pdf`, `.docx`, and `.html` files, semantically chunks them, generates 384-dimensional embeddings, and inserts them into PostgreSQL. Already-ingested documents are automatically skipped.

### 5. Start the AI Engine (Python)
```bash
cd ai-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Start the API Gateway (Java)
```bash
cd backend
# Use your local maven or the embedded wrapper
mvn spring-boot:run
```

### 7. Start the Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Access the application at: **http://localhost:4000**

## 🔐 Authentication & Roles

The platform enforces Role-Based Access Control (RBAC). On startup the backend seeds four default accounts (disable with `SEED_DEFAULT_USERS=false`):

| Username   | Password      | Role                |
|------------|---------------|---------------------|
| `admin`    | `password123` | `ADMIN`             |
| `engineer` | `password123` | `ENGINEER`          |
| `operator` | `password123` | `OPERATOR`          |
| `manager`  | `password123` | `MANAGER`           |

Self-registration through the API always creates `OPERATOR` accounts. Higher-privileged roles are provisioned by the seed only.

*(Note: There is a temporary "Demo Mode" bypass in the UI where entering `demo` / `demo` will allow you to view the Dashboard design if the backend databases are offline. Disable it by setting `VITE_DEMO_MODE=false` in `frontend/.env`).*

## 🧠 LLM (100% local — Ollama)

The AI service generates grounded answers using **Ollama** running entirely on your machine — no API keys, no external billing, zero cost.

1. Install Ollama: https://ollama.com
2. Pull a model: `ollama pull mistral` (or `llama3.1`, `phi3`, etc.)
3. The Docker Compose stack includes an Ollama container (port `11434`)
4. Default model is `mistral`; override with `OLLAMA_MODEL`
5. If Ollama is unreachable, the engine gracefully falls back to returning the top matching document chunk

## 🛠️ API Endpoints

### Gateway (Port 8080)
- `POST /api/auth/register` - Register a new user (`username`, `email`, `password`); always OPERATOR
- `POST /api/auth/login` - Authenticate and receive a JWT token
- `GET /api/auth/me` - Current user's username and role (requires `Bearer`)
- `POST /api/rag/query` - Secure RAG query proxy (requires `Bearer` token)
- `GET /api/knowledge/documents` - List ingested documents with chunk counts
- `DELETE /api/knowledge/documents/{id}` - Remove a document and its chunks
- `GET /api/system/health` - Database connectivity status
- `GET /api/system/ai-health` - AI service availability

### AI Service (Port 8000)
- `GET /health` - Liveness check
- `POST /api/v1/query` - Internal endpoint for vector similarity search + answer generation against `pgvector`

## ✅ Database migrations

The schema lives in `database/migrations/` and must be applied against the `mei_platform` database on port `5433`:

```powershell
Get-ChildItem database\migrations\*.sql | ForEach-Object {
  Get-Content $_.FullName | docker exec -i manufacturing-engineering-intelligence-postgres-1 psql -U postgres -d mei_platform
}
```

`V1` creates the `pgvector` tables; `V2` adds the HNSW vector index and lookup indexes.

## 🧪 Tests

- **Backend:** `cd backend; mvn test` (via the embedded Maven: `maven\apache-maven-3.9.6\bin\mvn.cmd test`)
- **AI service:** `cd ai-service; .\venv\Scripts\python.exe -m pytest tests -q`

## 📝 Technologies Used
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide React, react-markdown
- **Backend**: Java 17, Spring Boot 3, Spring Security (JWT)
- **AI/ML**: Python, FastAPI, asyncpg (connection pooling), sentence-transformers, Ollama (local LLM), Neo4j (knowledge graph)
- **Database**: PostgreSQL 15 + pgvector (HNSW index), Docker
