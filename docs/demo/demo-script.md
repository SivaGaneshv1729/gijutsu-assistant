# Demo Script

A guided walkthrough of the MEI Platform. Designed for a 10–15 minute presentation.

## Pre-demo checklist

1. All services running (see `docs/setup/quickstart.md`).
2. Knowledge base ingested:
   ```powershell
   .\venv_ingest\Scripts\activate
   python ingestion\pipeline.py knowledge-base\public
   ```
3. Ollama model pulled and running:
   ```powershell
   docker exec -it manufacturing-engineering-intelligence-ollama-1 ollama pull mistral
   ```
4. Both health checks green:
   - `http://localhost:8080/actuator/health` → `UP`
   - `http://localhost:8000/health` → `ok`
5. Browser window sized to a normal 15" laptop.

## 1. Login (1 min)

Open **http://localhost:4000** and sign in as:

```
engineer / password123
```

**Talking points:** JWT-based authentication, no shared passwords, RBAC across five roles. Switch to the *Register* tab and note that new accounts are always created as OPERATOR (privilege escalation is blocked).

## 2. AI Assistant (4–5 min)

Ask the assistant targeted, realistic questions:

- *"What is alarm E101?"* → expect a direct answer with source citations.
- *"How do I troubleshoot an injection pressure fault?"* → shows semantic retrieval (synonym/paraphrase matching, not keyword matching).
- *"What are the safety precautions before maintenance?"* → shows the model staying grounded in the manual.

**Talking points:**

- Expand a *Sources* citation to show the exact manual excerpt backing each answer.
- Emphasize the answer is generated **only from the retrieved context** — no hallucinated procedures.
- Show markdown rendering (headings, bold, lists) in the answer bubble.

## 3. Knowledge Base (2–3 min)

Navigate to **Knowledge Base**.

**Talking points:**

- Table shows every ingested document, its type, access level, chunk count, and ingestion date.
- Delete a low-value document to show governance (with confirmation).
- Explain the ingest pipeline: place a PDF/DOCX/HTML in `knowledge-base/public`, run one command, and it is chunked (≈500 tokens, 50-token overlap) and embedded into 384-dim vectors.

## 4. Settings & Health (1–2 min)

Navigate to **Settings**.

**Talking points:**

- Account shows the signed-in user and role.
- *Check health now* → green for API Gateway, AI Engine, and database.
- Intelligence Engine section summarizes model + retrieval configuration.

## 5. Role-based access (1–2 min) — optional

Log out and log in as `operator` / `password123`. Ask the same question and, where access levels differ, show restricted documents are simply absent from results (filtering happens inside the vector query, not after retrieval).

## 6. Close

- Add a document live (drop a PDF into `knowledge-base/public`, re-run the pipeline, refresh Knowledge Base, ask about it).
- Recap: 100% free stack — PostgreSQL/pgvector, sentence-transformers, Ollama — zero licensing cost, zero API bills.

## Demo pitfall card

| Problem | Fix |
|---------|-----|
| "could not find any relevant information" | Ingestion not run or document access level != role |
| Raw document text answers | Ollama model not pulled or not running — check with `docker exec -it manufacturing-engineering-intelligence-ollama-1 ollama list` |
| Slow responses | First inference call may be slow as model loads into memory; subsequent calls are fast |
| Everything works but feels static | Add 2–3 varied documents (PDF + DOCX + HTML) before the demo |
