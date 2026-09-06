from app.rag.prompting import (
    build_context,
    build_prompt,
    extractive_answer,
    no_results_answer,
)

CITATIONS = [
    {
        "id": "1",
        "text_content": "Alarm E101 indicates an injection pressure fault.",
        "name": "Shibaura_Manual.pdf",
        "access_level": "public",
    },
    {
        "id": "2",
        "text_content": "Check the hydraulic pressure relief valve before retrying.",
        "name": "SOP_Troubleshooting.pdf",
        "access_level": "public",
    },
]


def test_build_context_numbers_and_labels_sources():
    context = build_context(CITATIONS)
    assert "[1] Source: Shibaura_Manual.pdf" in context
    assert "[2] Source: SOP_Troubleshooting.pdf" in context
    assert "Alarm E101" in context


def test_build_context_respects_max_snippets():
    context = build_context(CITATIONS, max_snippets=1)
    assert "[1] Source:" in context
    assert "[2] Source:" not in context


def test_no_results_answer():
    assert "could not find" in no_results_answer()


def test_extractive_answer_returns_top_match():
    answer = extractive_answer(CITATIONS)
    assert "Shibaura_Manual.pdf" in answer
    assert "Alarm E101" in answer


def test_build_prompt_contains_question_and_context():
    prompt = build_prompt("What is alarm E101?", CITATIONS)
    assert "Question: What is alarm E101?" in prompt
    assert "Shibaura_Manual.pdf" in prompt
    assert "Answer:" in prompt