import os
import requests
import random
from typing import List, Dict

keys_env = os.getenv("GROQ_API_KEYS", "")
GROQ_API_KEYS = [k.strip() for k in keys_env.split(",") if k.strip()]

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "1024"))

class LLMService:
    def __init__(self):
        self.api_keys = list(GROQ_API_KEYS)  # copy
        self.model = GROQ_MODEL

    def _call_groq(self, messages: List[Dict[str, str]], temperature: float, api_key: str) -> str:
        """Make a single Groq API call with a specific key. Returns the content or raises."""
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": MAX_TOKENS
        }

        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

    def generate_completion(self, messages: List[Dict[str, str]], temperature: float = 0.0) -> str:
        """
        Calls the Groq Cloud API with retry logic across all available API keys.
        If all keys fail, falls back to an extractive (non-hallucinated) response.
        """
        if not self.api_keys:
            return self._extractive_fallback(messages)

        # Shuffle keys for load balancing, then try each one
        keys = list(self.api_keys)
        random.shuffle(keys)

        last_error = None
        for key in keys:
            try:
                result = self._call_groq(messages, temperature, key)
                if result and result.strip():
                    return result
            except requests.exceptions.HTTPError as e:
                last_error = e
                status = e.response.status_code if e.response is not None else 0
                # 401/403 = bad key, try next; 429 = rate limit, try next
                if status in (401, 403, 429):
                    continue
                # 400 = bad request (model issue), no point retrying with another key
                if status == 400:
                    break
                # 5xx = server error, try next key
                continue
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
                continue
            except Exception as e:
                last_error = e
                continue

        # All keys exhausted — fall back to extractive response
        print(f"GROQ API FAILED. Falling back. Last error: {last_error}", flush=True)
        return self._extractive_fallback(messages)

    def _extractive_fallback(self, messages: List[Dict[str, str]]) -> str:
        """
        Build a grounded response from the retrieved chunks embedded in the prompt.
        This avoids hallucination by only surfacing text that was actually retrieved.
        """
        full_prompt = "\n".join(msg.get("content", "") for msg in messages)

        # Extract the user question
        user_question = "your query"
        if "USER QUESTION:" in full_prompt:
            user_question = full_prompt.split("USER QUESTION:")[-1].strip()

        # Extract chunk content from the structured context block
        import re
        chunks = []
        chunk_blocks = full_prompt.split("--- Document Chunk")
        for block in chunk_blocks[1:]:
            section_match = re.search(r"Section:\s*(.*)", block)
            section = section_match.group(1).strip() if section_match else "Unknown"

            content_match = re.search(r"Content:\s*(.*?)(?=\n---|### END|$)", block, re.DOTALL)
            content = content_match.group(1).strip() if content_match else ""
            if content:
                chunks.append({"section": section, "content": content[:500]})

        if not chunks:
            return "I could not find sufficient information in the authorized engineering knowledge base to answer this reliably."

        response = "I could not generate a full synthesized answer right now. Here are the most relevant excerpts I found in the knowledge base:\n\n"
        for idx, info in enumerate(chunks[:5], 1):
            response += f"**{info['section']}**\n{info['content']} [{idx}]\n\n"
        return response

llm_service = LLMService()