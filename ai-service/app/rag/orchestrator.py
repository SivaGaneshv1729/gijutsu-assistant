from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.rag.hybrid_retriever import HybridRetriever
from app.llm.llm_service import llm_service
from app.rag.prompts import SYSTEM_PROMPT, build_context_block
from app.rag.external_search import get_external_context

# Roles recognized by the platform (see docs/architecture/security.md)
ALLOWED_ACCESS_LEVELS = {"PUBLIC", "OPERATOR", "ENGINEER", "MAINTENANCE_ENGINEER", "MANAGER", "ADMIN"}

# --- Agentic Planner ---
# Keywords that signal the user wants a complex, multi-step task
MULTI_STEP_SIGNALS = [
    "compare", "analyze and", "find all", "search and then", "report", "summarize all",
    "cross-reference", "what are all", "multiple", "comprehensive", "compare results",
    "step by step plan", "action plan",
]

def _detect_agent_mode(question: str) -> bool:
    """Returns True if the question needs multi-step agentic processing."""
    q = question.lower()
    return any(signal in q for signal in MULTI_STEP_SIGNALS)


class RAGOrchestrator:
    def __init__(self, db: Session):
        self.retriever = HybridRetriever(db)

    def _plan_subtasks(self, user_question: str) -> List[str]:
        """
        Uses the LLM to decompose a complex question into a list of 2-4 sub-tasks.
        This is the 'Planner' step in Agentic RAG.
        """
        planner_messages = [
            {"role": "system", "content": (
                "You are a task decomposition engine. Your job is to break a complex user question "
                "into a concise numbered list of 2-4 concrete sub-tasks that can be independently researched. "
                "Each sub-task must be on its own line starting with a number and period (e.g., '1. Find...'). "
                "Output ONLY the numbered list. No introduction, no explanation."
            )},
            {"role": "user", "content": f"Decompose this question into sub-tasks:\n\n{user_question}"}
        ]
        plan_text = llm_service.generate_completion(planner_messages, temperature=0.1)
        subtasks = []
        for line in (plan_text or "").splitlines():
            line = line.strip()
            if line and line[0].isdigit():
                # Strip the leading number (e.g., "1. ")
                parts = line.split(".", 1)
                if len(parts) > 1:
                    subtasks.append(parts[1].strip())
        return subtasks if subtasks else [user_question]

    def _execute_subtask(self, subtask: str, access_level: str, document_ids: List[str] = None) -> Dict[str, Any]:
        """Executes a single sub-task: RAG retrieval + external search."""
        chunks = self.retriever.retrieve(subtask, access_level=access_level, top_k=4, document_ids=document_ids)
        external = get_external_context(subtask, max_results=1) if not document_ids else {'text': '', 'images': []}
        return {"subtask": subtask, "chunks": chunks, "external": external}

    def query(self, user_question: str, access_level: str = "OPERATOR", language: str = "en", document_ids: List[str] = None) -> Dict[str, Any]:
        """
        Orchestrates the entire RAG pipeline for a given user query.
        For complex queries, automatically enters Agentic multi-step mode.
        """
        # Normalize + validate the caller's role
        access_level = (access_level or "OPERATOR").strip().upper()
        if access_level not in ALLOWED_ACCESS_LEVELS:
            access_level = "OPERATOR"

        # 1. Short-circuit for simple greetings
        greetings = {"hi", "hello", "hey", "good morning", "good afternoon", "hi there",
                     "hello there", "holla", "hola", "greetings"}
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

        # --- 2. Decide: Standard RAG vs Agentic Multi-Step ---
        is_agentic = _detect_agent_mode(user_question)
        all_chunks = []
        all_external_images = []
        context_block = ""

        if is_agentic:
            print(f"[AGENT MODE] Decomposing query: {user_question}")
            subtasks = self._plan_subtasks(user_question)
            print(f"[AGENT MODE] Sub-tasks: {subtasks}")

            agentic_context_parts = []
            for i, subtask in enumerate(subtasks, 1):
                result = self._execute_subtask(subtask, access_level, document_ids)
                agentic_context_parts.append(f"### Research Step {i}: {subtask}\n")
                if result["chunks"]:
                    all_chunks.extend(result["chunks"])
                    agentic_context_parts.append(build_context_block(result["chunks"]))
                if result["external"]["text"]:
                    agentic_context_parts.append(f"\n[External] {result['external']['text']}\n")
                if result["external"]["images"]:
                    all_external_images.extend(result["external"]["images"])

            context_block = "\n".join(agentic_context_parts)
            synthesis_instruction = (
                "You have just completed a multi-step research task. "
                "Now SYNTHESIZE all gathered research into a comprehensive, well-structured final report. "
                "Use clear headers for each section. Be thorough."
            )
        else:
            # Standard single-step RAG
            all_chunks = self.retriever.retrieve(user_question, access_level=access_level, top_k=8, document_ids=document_ids)
            if all_chunks:
                context_block = build_context_block(all_chunks)

            external_data = get_external_context(user_question, max_results=2) if not document_ids else {'text': '', 'images': []}
            if external_data["text"]:
                context_block += f"\n\n--- EXTERNAL WEB KNOWLEDGE ---\n{external_data['text']}\n"
            all_external_images = external_data.get("images", [])
            synthesis_instruction = ""

        # 3. Language enforcement
        lang_instruction = (
            "CRITICAL REQUIREMENT: You MUST answer the user in JAPANESE (日本語) exclusively."
            if language == "ja"
            else "CRITICAL REQUIREMENT: You MUST answer the user in ENGLISH exclusively."
        )

        user_content = f"{context_block}\n\nUSER QUESTION: {user_question}"
        if synthesis_instruction:
            user_content += f"\n\n{synthesis_instruction}"
        user_content += f"\n\n{lang_instruction}"

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]

        # 4. Generate LLM response
        answer = llm_service.generate_completion(messages, temperature=0.1)

        # Extractive fallback
        if not answer or not answer.strip():
            if all_chunks:
                top = all_chunks[0]
                answer = (
                    "I could not generate a full answer right now. Here is what I found:\n\n"
                    f"**Source:** {top.get('doc_name', 'Unknown')}"
                    f"\n{top.get('content', '')}"
                )
            else:
                answer = "I could not find relevant information to answer your question."

        # 5. Build citations list
        seen_ids = set()
        citations = []
        for chunk in all_chunks:
            cid = str(chunk.get("chunk_id", ""))
            if cid in seen_ids:
                continue
            seen_ids.add(cid)
            citations.append({
                "id": cid,
                "text_content": chunk.get("content", ""),
                "name": chunk.get("doc_name"),
                "access_level": chunk.get("access_level"),
                "rrf_score": chunk.get("rrf_score"),
                "image_url": chunk.get("image_url"),
                "page_number": chunk.get("page_number"),
            })

        # 6. Append External Images as Citations
        for i, img in enumerate(all_external_images):
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