import os
from openai import OpenAI
from typing import List, Dict

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY")
        self.model = os.getenv("LLM_MODEL", "gpt-4o")
        
        # We will initialize the client if API key exists. For demo purposes without key, 
        # it might throw an error if used, but it allows the app to start up.
        if self.api_key and self.api_key != "your_api_key_here":
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def generate_completion(self, messages: List[Dict[str, str]], temperature: float = 0.0) -> str:
        """
        Generates a completion from the LLM based on a conversation history (messages).
        """
        if not self.client:
            return "ERROR: LLM_API_KEY is not configured or invalid."

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling LLM: {e}")
            return "ERROR: Failed to generate response from LLM."

llm_service = LLMService()
