# Manufacturing Engineering Intelligence (MEI) Platform

An enterprise-grade Hybrid Retrieval-Augmented Generation (RAG) Chatbot designed to assist manufacturing engineers and operators. The MEI Platform instantly surfaces technical manuals, SOPs, and machine troubleshooting guides with inline images and step-by-step procedures using advanced AI similarity search.

## ?? Recent Updates (v2.0)

- **Hyper-Realistic Landing Page**: A completely redesigned, premium landing page featuring a fully CSS-rendered 3D interactive application dashboard, glowing bento grids, and dynamic animations.
- **Unified Copilot Dashboard**: Refactored the main application interface into a seamless Single Page Application (`/app`) combining the AI Chat Copilot, Neo4j Knowledge Graph Visualization, Telemetry Analytics, and Admin Uploads.
- **Dark Mode Glassmorphism**: Overhauled the authentication screens (`/login`) and main layout with enterprise-grade dark themes, translucent glass panels, and deep glow effects.

## ??? Architecture overview

The platform is built on a modern microservices architecture:

1. **Frontend (`/frontend`)**: A React + Vite application styled with Tailwind CSS. Features an incredibly premium UI, AI Engineering Copilot chat interface, markdown rendering for images/steps, and a secure Admin Document Upload panel.
2. **API Gateway (`/backend`)**: A Java Spring Boot application running on port `8080`. Acts as the primary entry point, handling JWT Security, Role-Based Access Control (RBAC), and proxying authorized queries to the AI Engine. It also handles multipart file uploads to a shared Docker volume.
3. **AI Engine (`/ai-service`)**: A Python FastAPI application running on port `8000`. Uses HuggingFace's `sentence-transformers` (`all-MiniLM-L6-v2`) to embed user queries and execute vector math against the database.
4. **Ingestion Pipeline (`/ingestion`)**: A Python-based ETL pipeline that reads technical PDFs, semantically chunks them, generates 384-dimensional embeddings, and inserts them into PostgreSQL.
5. **Infrastructure (`docker-compose.yml`)**: Containerized databases including PostgreSQL (with `pgvector` enabled on port `5433`), OpenSearch, Neo4j, and a shared `uploads_data` volume.

## ?? Repository Structure

```text
manufacturing-engineering-intelligence/
+-- ai-service/          # Python FastAPI (RAG Retrieval Engine)
+-- backend/             # Java Spring Boot (Auth & API Gateway)
+-- frontend/            # React + Vite (Web UI & Copilot Dashboard)
+-- ingestion/           # Python (PDF Parsing & Vector Embedding)
+-- database/            # SQL Migrations (pgvector schema)
+-- knowledge-base/      # Raw technical manuals and PDFs (e.g., MEI E101)
+-- docs/                # Setup, architecture, API reference, demo script, ADRs
+-- docker-compose.yml   # Infrastructure orchestration
+-- README.md            # Project documentation
```

## ?? Documentation

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

## ? Prerequisites

- **Docker Desktop** (Must be running for database infrastructure)
- **Java 17** (or use the embedded Maven wrapper)
- **Python 3.10+** (For AI Service and Ingestion)
- **Node.js 18+** (For Frontend)
- **Ollama** (Included in Docker Compose - local LLM, zero cost)
