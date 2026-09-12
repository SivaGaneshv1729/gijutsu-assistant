from typing import Dict, Any
from sqlalchemy.orm import Session
from app.rag.hybrid_retriever import HybridRetriever
from app.llm.llm_service import llm_service
from app.rag.prompts import SYSTEM_PROMPT, build_context_block
from app.graph.neo4j_client import neo4j_manager
import re

class RAGOrchestrator:
    def __init__(self, db: Session):
        self.retriever = HybridRetriever(db)

    def query(self, user_question: str) -> Dict[str, Any]:
        """
        Orchestrates the entire RAG pipeline for a given user query.
        """
        # 1. Retrieve hybrid evidence
        top_chunks = self.retriever.retrieve(user_question, top_k=5)
        
        # 2. Hallucination Control: Check if we have good evidence
        # In a real system, we'd check if the RRF score or cosine similarity is above a threshold.
        # Here, if no chunks are retrieved, we fallback immediately.
        if not top_chunks:
            return {
                "answer": "I could not find sufficient information in the authorized engineering knowledge base to answer this reliably.",
                "citations": [],
                "confidence": "Low"
            }
            
        # 3. Assemble prompt context
        context_block = build_context_block(top_chunks)
        
        # Extract potential entities from query to fetch graph context
        # Very simple heuristic for demo: extract capitalized words as entities
        entities = re.findall(r'\b[A-Z][a-zA-Z0-9-]+\b', user_question)
        graph_context = ""
        for entity in set(entities):
            if entity.lower() not in ["what", "how", "why", "who", "when", "is", "the", "a", "an"]:
                graph_context += neo4j_manager.get_context_for_entity(entity)
        
        if graph_context:
            context_block += f"\n\n{graph_context}"
        
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"{context_block}\n\nUSER QUESTION: {user_question}"}
        ]
        
        # 4. Generate LLM response
        answer = llm_service.generate_completion(messages, temperature=0.1)
        
        # 5. Build citations list for UI
        citations = []
        for chunk in top_chunks:
            citations.append({
                "chunk_id": chunk.get("chunk_id"),
                "section": chunk.get("section"),
                "rrf_score": chunk.get("rrf_score")
            })

        return {
            "answer": answer,
            "citations": citations,
            "confidence": "High" if len(citations) > 2 else "Medium"
        }
