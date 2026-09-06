from bs4 import BeautifulSoup
from typing import List, Dict, Any

class HTMLParser:
    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Parses an HTML file and extracts text, retaining tag information for headings.
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                soup = BeautifulSoup(f, "html.parser")
                
            elements = []
            for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'table', 'li']):
                text = tag.get_text(separator=' ', strip=True)
                if text:
                    elements.append({
                        "page_number": None,
                        "text": text,
                        "tag": tag.name
                    })
            return elements
        except Exception as e:
            print(f"Error parsing HTML {file_path}: {e}")
            return []
