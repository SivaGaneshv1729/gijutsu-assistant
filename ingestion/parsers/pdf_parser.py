import fitz  # PyMuPDF
from typing import List, Dict, Any

class PDFParser:
    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Parses a PDF file and returns a list of pages with their text.
        Returns:
            List of dicts: [{"page_number": int, "text": str}]
        """
        try:
            doc = fitz.open(file_path)
            pages = []
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text()
                pages.append({
                    "page_number": page_num + 1,
                    "text": text
                })
            return pages
        except Exception as e:
            print(f"Error parsing PDF {file_path}: {e}")
            return []
