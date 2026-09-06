import tiktoken
from typing import List, Dict, Any

class SemanticChunker:
    def __init__(self, target_chunk_size=500, overlap_size=50, model_name="gpt-4o"):
        self.target_chunk_size = target_chunk_size
        self.overlap_size = overlap_size
        try:
            self.tokenizer = tiktoken.encoding_for_model(model_name)
        except KeyError:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")

    def count_tokens(self, text: str) -> int:
        return len(self.tokenizer.encode(text))

    def chunk_elements(self, elements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes a list of parsed elements (from HTML, DOCX, or PDF) and chunks them.
        Assumes elements have: 'text', 'page_number', and optionally 'tag' or 'style'.
        """
        chunks = []
        current_chunk_text = ""
        current_tokens = 0
        current_section = "General"
        current_page = None
        
        for el in elements:
            text = el.get("text", "").strip()
            if not text:
                continue
                
            page = el.get("page_number")
            if page:
                current_page = page
                
            tag = el.get("tag", "").lower()
            style = str(el.get("style", "")).lower()
            
            # Detect headings
            if "h1" in tag or "h2" in tag or "h3" in tag or "heading" in style:
                current_section = text
                
            el_tokens = self.count_tokens(text)
            
            if current_tokens + el_tokens > self.target_chunk_size and current_tokens > 0:
                chunks.append({
                    "text": current_chunk_text.strip(),
                    "section": current_section,
                    "page_number": current_page,
                    "token_count": current_tokens
                })
                # Simple overlap heuristic: take the last ~overlap_size tokens worth of characters
                chars_per_token = 4
                overlap_chars = self.overlap_size * chars_per_token
                overlap_text = current_chunk_text[-overlap_chars:] if len(current_chunk_text) > overlap_chars else current_chunk_text
                
                current_chunk_text = overlap_text + "\n" + text
                current_tokens = self.count_tokens(current_chunk_text)
            else:
                current_chunk_text += "\n" + text if current_chunk_text else text
                current_tokens = self.count_tokens(current_chunk_text)
                
        if current_chunk_text.strip():
            chunks.append({
                "text": current_chunk_text.strip(),
                "section": current_section,
                "page_number": current_page,
                "token_count": current_tokens
            })
            
        return chunks
