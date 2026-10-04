# Manufacturing Engineering Intelligence (MEI) Platform

An enterprise-grade Hybrid Retrieval-Augmented Generation (RAG) Chatbot designed to assist manufacturing engineers and operators. The MEI Platform instantly surfaces technical manuals, SOPs, and machine troubleshooting guides with inline images and step-by-step procedures using advanced AI similarity search.

## 🚀 Recent Updates (v3.0 - The "Cyber-Physical" Update)

- **Interactive 3D Hardware Analytics Dashboard**: An entirely new dashboard module (/analytics) featuring high-fidelity WebGL 3D models (@google/model-viewer) of industrial hardware. Users can interact with spinning 3D turbines and motors while analyzing live node metrics and server telemetry in a sleek glassmorphism UI.
- **3D Spatial Knowledge Graph**: Upgraded the Neo4j visualization core from 2D to a true spatial 3D physics engine (
eact-force-graph-3d). Navigate your manufacturing ontology clusters (Entities, Documents, and Relationships) in a fully manipulable 3D space with dynamic link generation.
- **Real-Time Neo4j Sync Engine**: Zero-latency graph population. When admins upload new PDFs to the portal, the Python AI Service instantly chunks the text and autonomously spawns semantic entity nodes in the 3D graph database.
- **Voice-Enabled AI (TTS)**: The Copilot now features robust Text-To-Speech (TTS) capabilities. The browser engine parses massive AI technical responses and streams them into sentence-chunked voice packets to prevent browser crashing or voice buffer overloads.
- **Japanese Localization Engine**: Added complete seamless UTF-8 localization. Users can instantly pivot the entire UI, prompts, and graph metadata to Japanese.

## 🏛 Architecture Overview

The platform is built on a modern microservices architecture with a hyper-optimized RAG pipeline:

`mermaid
graph TD
    %% Define Themes
    classDef client fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef gateway fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#fff;
    classDef ai fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef db fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#fff;

    %% Nodes
    UI[Frontend: React + Vite<br/>3D Analytics & Chat]:::client
    Gateway[Backend: Java Spring Boot<br/>Auth & Routing Gateway]:::gateway
    AI[AI Service: Python FastAPI<br/>LLM & Vector Math Engine]:::ai
    Ingest[Ingestion Pipeline<br/>PDF OCR & Chunking]:::ai
    
    PG[(PostgreSQL + pgvector<br/>Vector Similarity)]:::db
    Neo[(Neo4j<br/>3D Knowledge Graph)]:::db
    OS[(OpenSearch<br/>Keyword Metrics)]:::db
    
    %% Relationships
    UI <-->|REST & TTS| Gateway
    Gateway <-->|Proxy Auth| AI
    Ingest -->|Vectors| PG
    Ingest -->|Entities| Neo
    AI <-->|Similarity Search| PG
    AI <-->|Graph Traversal| Neo
    Gateway <-->|Telemetry logs| OS
`

1. **Frontend (/frontend)**: A React + Vite application styled with Tailwind CSS. Features an incredibly premium UI, AI Engineering Copilot chat interface, WebGL rendering, and a secure Admin Document Upload panel.
2. **API Gateway (/backend)**: A Java Spring Boot application running on port 8080. Acts as the primary entry point, handling security, tracking requests, and proxying authorized queries to the AI Engine.
3. **AI Engine (/ai-service)**: A Python FastAPI application running on port 8000. Uses HuggingFace embeddings (ll-MiniLM-L6-v2) to execute vector math against Postgres and trigger Neo4j entity synchronization.
4. **Ingestion Pipeline (/ingestion)**: A robust ETL pipeline that reads technical PDFs, semantically chunks them, generates 384-dimensional embeddings, and cross-pollinates data across Postgres and Neo4j simultaneously.
5. **Infrastructure (docker-compose.yml)**: Containerized databases including PostgreSQL (port 5433), OpenSearch, Neo4j, and a shared uploads_data volume.

## 📁 Repository Structure

`	ext
manufacturing-engineering-intelligence/
+-- ai-service/          # Python FastAPI (RAG Engine & Neo4j Sync)
+-- backend/             # Java Spring Boot (Auth & API Gateway)
+-- frontend/            # React + Vite (3D Dashboard & AI Chat)
+-- ingestion/           # Python (PDF Parsing & Vector Embedding)
+-- database/            # SQL Migrations (pgvector schema)
+-- knowledge-base/      # Raw technical manuals and PDFs
+-- docs/                # Setup, architecture, API reference, demo script
+-- docker-compose.yml   # Infrastructure orchestration
+-- README.md            # Project documentation
`

## 📚 Documentation

The entire platform's technical documentation has been streamlined and consolidated into a single master document:

- [📖 The MEI Technical Manual](docs/TECHNICAL_MANUAL.md) (Includes Setup, Architecture, Data Models, Security, and API Reference)

## ⚡ Prerequisites

- **Docker Desktop** (Must be running for database infrastructure)
- **Java 17** (or use the embedded Maven wrapper)
- **Python 3.10+** (For AI Service and Ingestion)
- **Node.js 20+** (For Frontend Vite + React-Force-Graph-3D)
- **Ollama** (Included in Docker Compose - local LLM, zero cost)
