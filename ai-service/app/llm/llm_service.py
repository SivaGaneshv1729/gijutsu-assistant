import json
import os
import urllib.request
import urllib.error
from typing import List, Dict

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "120"))
MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "512"))


class LLMService:
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL
        self.model = OLLAMA_MODEL

    def _messages_to_prompt(self, messages: List[Dict[str, str]]) -> str:
        """Flatten OpenAI-style {role, content} messages into a single prompt."""
        parts = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                parts.append(f"System: {content}")
            elif role == "assistant":
                parts.append(f"Assistant: {content}")
            else:
                parts.append(f"User: {content}")
        return "\n\n".join(parts)

    def generate_completion(self, messages: List[Dict[str, str]], temperature: float = 0.0) -> str:
        """
        Generates a grounded completion using a basic internal string summarizer.
        This replaces the disabled local Ollama LLM.
        """
        prompt = self._messages_to_prompt(messages)
        
        import re
        
        # Parse User Question
        if "USER QUESTION:" in prompt:
            user_question = prompt.split("USER QUESTION:")[-1].strip()
        else:
            user_question = "your query"
            
        chunks_info = []
        chunk_blocks = prompt.split("--- Document Chunk")
        if len(chunk_blocks) > 1:
            for block in chunk_blocks[1:]:
                # Extract Section
                section_match = re.search(r"Section:\s*(.*)", block)
                section = section_match.group(1).strip() if section_match else "Unknown Section"
                
                # Extract Image_URL
                img_match = re.search(r"Image_URL:\s*(.*)", block)
                img_url = img_match.group(1).strip() if img_match else None
                
                # Extract Content
                content_match = re.search(r"Content:\s*(.*?)(?=\n---|\n### END|$)", block, re.DOTALL)
                content = content_match.group(1).strip() if content_match else ""
                
                chunks_info.append({"section": section, "content": content, "img_url": img_url})
                
        if not chunks_info:
            return "I could not find sufficient information in the authorized engineering knowledge base to answer this reliably."
            
        response = f"### Summary\nBased on the engineering knowledge base, here is the information related to: **{user_question}**\n\n"
        
        response += "### Details / Steps\n"
        for idx, info in enumerate(chunks_info, 1):
            response += f"{idx}. **From {info['section']}**\n"
            response += f"   {info['content']}\n"
            if info['img_url']:
                response += f"\n   ![Reference Image]({info['img_url']})\n"
            response += "\n"
            
        response += "### Evidence\n"
        for info in chunks_info:
            response += f"- {info['section']}\n"
            
        return response


llm_service = LLMService()