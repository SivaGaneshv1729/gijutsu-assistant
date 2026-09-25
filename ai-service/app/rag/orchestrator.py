from typing import Dict, Any
from sqlalchemy.orm import Session
from app.rag.hybrid_retriever import HybridRetriever
from app.llm.llm_service import llm_service
from app.rag.prompts import SYSTEM_PROMPT, build_context_block
from app.rag.external_search import get_external_context

# Roles recognized by the platform (see docs/architecture/security.md)
ALLOWED_ACCESS_LEVELS = {"PUBLIC", "OPERATOR", "ENGINEER", "MAINTENANCE_ENGINEER", "MANAGER", "ADMIN"}

class RAGOrchestrator:
    def __init__(self, db: Session):
        self.retriever = HybridRetriever(db)

    def query(self, user_question: str, access_level: str = "OPERATOR", language: str = "en") -> Dict[str, Any]:
        """
        Orchestrates the entire RAG pipeline for a given user query, honouring the
        caller's access level so only authorized content is retrieved (ADR-005).
        """
        # Normalize + validate the caller's role; fall back to the least-privileged.
        access_level = (access_level or "OPERATOR").strip().upper()
        if access_level not in ALLOWED_ACCESS_LEVELS:
            access_level = "OPERATOR"

        # 1. Short-circuit for simple greetings
        greetings = {"hi", "hello", "hey", "good morning", "good afternoon", "hi there", "hello there", "holla", "hola", "greetings"}
        if user_question.strip().lower() in greetings:
            if language == "ja":
                return {
                    "answer": "こんにちは！私はMEIアシスタントです。本日はどのような機械のドキュメントについてお手伝いしましょうか？",
                    "citations": [],
                    "confidence": "High"
                }
            return {
                "answer": "Hello! I am the MEI assistant. How can I help you with your machine documentation today?",
                "citations": [],
                "confidence": "High"
            }

        # 2. Retrieve hybrid evidence, filtered to the caller's access level
        top_chunks = self.retriever.retrieve(user_question, access_level=access_level, top_k=8)

        # 2. Hallucination Control: if we have no authorized evidence, say so.
        # But wait! Now we have external sources. We don't fail immediately.
        
        # 3. Assemble prompt context
        context_block = ""
        if top_chunks:
            context_block = build_context_block(top_chunks)
        
        # 3.5. Fetch External Web Summary & Images
        external_data = get_external_context(user_question, max_results=2)
        if external_data["text"]:
            context_block += f"\n\n--- EXTERNAL WEB KNOWLEDGE ---\n{external_data['text']}\n"

        lang_instruction = f"CRITICAL REQUIREMENT: You MUST answer the user in JAPANESE (日本語) exclusively." if language == "ja" else f"CRITICAL REQUIREMENT: You MUST answer the user in ENGLISH exclusively."

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"{context_block}\n\nUSER QUESTION: {user_question}\n\n{lang_instruction}"}
        ]

        # 4. Generate LLM response (local Ollama). If the lightweight fallback
        # answer produced by the pipeline is returned, we already have evidence.
        answer = llm_service.generate_completion(messages, temperature=0.1)

        # Extractive fallback: if Ollama is unavailable, ground the answer in the
        # top retrieved chunk rather than returning a fabricated/error response.
        if not answer or not answer.strip():
            top = top_chunks[0]
            answer = (
                "I could not generate a full answer right now. Here is what I found:\n\n"
                f"**Source:** {top.get('doc_name', 'Unknown')}"
                f"\n{top.get('content', '')}"
            )

        # 5. Build citations list for UI
        citations = []
        for chunk in top_chunks:
            citations.append({
                "id": str(chunk.get("chunk_id", "")),
                "text_content": chunk.get("content", ""),
                "name": chunk.get("doc_name"),
                "access_level": chunk.get("access_level"),
                "rrf_score": chunk.get("rrf_score"),
                "image_url": chunk.get("image_url"),
                "page_number": chunk.get("page_number"),
            })
            
        # 6. Append External Images as Citations
        for i, img in enumerate(external_data["images"]):
            citations.append({
                "id": f"external_img_{i}",
                "text_content": f"External image from web source: {img['title']}\nSource: {img['source_url']}",
                "name": img["title"],
                "access_level": "PUBLIC",
                "image_url": img["image_url"],
                "page_number": None,
            })

        return {
            "answer": answer,
            "citations": citations,
            "confidence": "High" if len(citations) > 2 else "Medium"
        }