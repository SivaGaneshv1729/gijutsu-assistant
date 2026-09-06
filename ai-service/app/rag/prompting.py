from typing import List


def build_context(citations: List[dict], max_snippets: int = 5) -> str:
    """Format retrieved chunks into a numbered context block for the LLM prompt."""
    blocks = []
    for i, c in enumerate(citations[:max_snippets], start=1):
        blocks.append(f"[{i}] Source: {c['name']}\n{c['text_content']}")
    return "\n\n".join(blocks)


def no_results_answer() -> str:
    return (
        "I could not find any relevant information in the knowledge base. "
        "Try rephrasing your question or adding more documents."
    )


def extractive_answer(citations: List[dict]) -> str:
    """Fallback when no LLM is configured or available: return the top matched chunk."""
    top = citations[0]
    return (
        "I found this information in the knowledge base (first match):\n\n"
        f"**Source:** {top['name']}\n{top['text_content']}"
    )


def build_prompt(query: str, citations: List[dict]) -> str:
    context = build_context(citations)
    return (
        "You are the Manufacturing Engineering Intelligence (MEI) assistant. "
        "Answer the question using ONLY the context provided below. "
        "If the context does not contain the answer, say you could not find it. "
        "Be concise, technical, and cite the source name.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {query}\n"
        "Answer:"
    )