from app.llm.client import check_ollama_health, generate_completion, generate_rag_answer


def test_check_ollama_health_returns_bool():
    import asyncio
    result = asyncio.get_event_loop().run_until_complete(check_ollama_health())
    assert isinstance(result, bool)


def test_generate_completion_returns_string():
    import asyncio
    result = asyncio.get_event_loop().run_until_complete(
        generate_completion("Say hello", max_tokens=10)
    )
    assert isinstance(result, str)


def test_generate_rag_answer_no_citations():
    import asyncio
    result = asyncio.get_event_loop().run_until_complete(
        generate_rag_answer("test", [])
    )
    assert "could not find" in result.lower()


def test_generate_rag_answer_with_citations():
    import asyncio
    citations = [{"name": "manual.pdf", "text_content": "Alarm E101 indicates a pressure fault."}]
    result = asyncio.get_event_loop().run_until_complete(
        generate_rag_answer("What is E101?", citations)
    )
    assert isinstance(result, str)
    assert len(result) > 0
