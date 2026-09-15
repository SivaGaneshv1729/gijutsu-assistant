import json
import os
import requests
from typing import List, Dict

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")
MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "1024"))

class LLMService:
    def __init__(self):
        self.api_key = GROQ_API_KEY
        self.model = GROQ_MODEL

    def _fallback_generation(self, messages: List[Dict[str, str]]) -> str:
        """Fallback to simple string parsing if API key is not set."""
        prompt = ""
        for msg in messages:
            prompt += f"{msg.get('role', 'user')}: {msg.get('content', '')}\n"
            
        import re
        if "USER QUESTION:" in prompt:
            user_question = prompt.split("USER QUESTION:")[-1].strip()
        else:
            user_question = "your query"
            
        chunks_info = []
        chunk_blocks = prompt.split("--- Document Chunk")
        if len(chunk_blocks) > 1:
            for block in chunk_blocks[1:]:
                section_match = re.search(r"Section:\s*(.*)", block)
                section = section_match.group(1).strip() if section_match else "Unknown Section"
                
                content_match = re.search(r"Content:\s*(.*?)(?=\n---|\n### END|$)", block, re.DOTALL)
                content = content_match.group(1).strip() if content_match else ""
                chunks_info.append({"section": section, "content": content})
                
        if not chunks_info:
            return "I could not find sufficient information in the authorized engineering knowledge base to answer this reliably."
            
        response = f"*(Note: You are viewing the basic fallback response because GROQ_API_KEY is missing in the ai-service environment variables)*\n\n"
        response += f"### Summary for: **{user_question}**\n\n"
        for idx, info in enumerate(chunks_info, 1):
            response += f"{idx}. **From {info['section']}**\n   {info['content']}\n\n"
        return response

    def generate_completion(self, messages: List[Dict[str, str]], temperature: float = 0.0) -> str:
        """
        Calls the Groq Cloud API to generate a high-quality response.
        If no API key is provided, falls back to basic string parsing.
        """
        if not self.api_key:
            return self._fallback_generation(messages)
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": MAX_TOKENS
        }
        
        try:
            response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            return f"**Error communicating with Cloud API:** {str(e)}\n\n*(Falling back to basic response)*\n\n" + self._fallback_generation(messages)

llm_service = LLMService()