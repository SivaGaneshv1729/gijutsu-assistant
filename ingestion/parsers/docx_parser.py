import docx
from typing import List, Dict, Any

class DocxParser:
    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Parses a DOCX file. Since DOCX doesn't have a strong concept of pages,
        we return paragraphs with their heading styles.
        """
        try:
            doc = docx.Document(file_path)
            paragraphs = []
            for para in doc.paragraphs:
                if para.text.strip():
                    paragraphs.append({
                        "page_number": None,
                        "text": para.text,
                        "style": para.style.name if para.style else None
                    })
            return paragraphs
        except Exception as e:
            print(f"Error parsing DOCX {file_path}: {e}")
            return []
