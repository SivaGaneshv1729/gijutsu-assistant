import os
import sys
from pathlib import Path
from typing import List, Dict, Any

import psycopg2
from psycopg2.extras import execute_values
from sentence_transformers import SentenceTransformer

try:
    from parsers.pdf_parser import PDFParser
    from parsers.docx_parser import DocxParser
    from parsers.html_parser import HTMLParser
    from chunkers.semantic_chunker import SemanticChunker
except ImportError:
    from ingestion.parsers.pdf_parser import PDFParser
    from ingestion.parsers.docx_parser import DocxParser
    from ingestion.parsers.html_parser import HTMLParser
    from ingestion.chunkers.semantic_chunker import SemanticChunker

# DB config
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5433")
DB_NAME = os.getenv("DB_NAME", "mei_platform")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "postgres")

# Default access level applied to ingested documents
DEFAULT_ACCESS_LEVEL = os.getenv("DEFAULT_ACCESS_LEVEL", "public")

# Map file extensions to parsers
PARSER_MAP = {
    ".pdf": PDFParser,
    ".docx": DocxParser,
    ".html": HTMLParser,
    ".htm": HTMLParser,
}

SUPPORTED_EXTENSIONS = tuple(PARSER_MAP.keys())


def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )


def document_exists(cursor, document_name: str) -> bool:
    cursor.execute("SELECT 1 FROM documents WHERE name = %s LIMIT 1", (document_name,))
    return cursor.fetchone() is not None


def main(scan_dir: str, access_level: str = DEFAULT_ACCESS_LEVEL):
    scan_path = Path(scan_dir)
    if not scan_path.exists():
        print(f"Directory {scan_path} does not exist.")
        return

    print("Loading embedding model...")
    model = SentenceTransformer(os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2"))

    chunker = SemanticChunker()

    conn = get_db_connection()
    cursor = conn.cursor()

    files = sorted(
        p for p in scan_path.rglob("*")
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
    )

    if not files:
        print(f"No supported documents (.pdf, .docx, .html) found in {scan_path}")
        cursor.close()
        conn.close()
        return

    ingested = 0
    skipped = 0
    failed = 0

    try:
        for file_path in files:
            parser_cls = PARSER_MAP.get(file_path.suffix.lower())
            if parser_cls is None:
                continue

            document_name = file_path.name

            if document_exists(cursor, document_name):
                print(f"Skipping {document_name} (already ingested).")
                skipped += 1
                continue

            print(f"Processing {file_path}...")

            try:
                parser = parser_cls()
                elements = parser.parse(str(file_path))
                if not elements:
                    print(f"  No content extracted from {file_path}")
                    failed += 1
                    continue

                chunks = chunker.chunk_elements(elements)
                if not chunks:
                    print(f"  No chunks created for {file_path}")
                    failed += 1
                    continue

                cursor.execute(
                    """
                    INSERT INTO documents (name, type, access_level)
                    VALUES (%s, %s, %s)
                    RETURNING id;
                    """,
                    (document_name, file_path.suffix.lower().lstrip('.'), access_level)
                )
                document_id = cursor.fetchone()[0]

                # Encode all chunk texts at once, then batch-insert rows
                texts = [c.get("text", "").strip() for c in chunks]
                texts = [t for t in texts if t]
                if not texts:
                    print(f"  No non-empty chunks for {file_path}")
                    cursor.execute("DELETE FROM documents WHERE id = %s", (document_id,))
                    failed += 1
                    continue

                embeddings = model.encode(texts).tolist()
                rows = [(document_id, text, embedding) for text, embedding in zip(texts, embeddings)]

                execute_values(
                    cursor,
                    """
                    INSERT INTO document_chunks (document_id, text_content, embedding)
                    VALUES %s
                    """,
                    rows,
                    page_size=100,
                )

                conn.commit()
                print(f"  Ingested {document_name} with {len(texts)} chunks.")
                ingested += 1

            except Exception as e:
                print(f"  Failed to ingest {file_path}: {e}")
                conn.rollback()
                failed += 1

    except Exception as e:
        print(f"Error during ingestion: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

    print(f"\nIngestion complete: {ingested} ingested, {skipped} skipped, {failed} failed.")


if __name__ == "__main__":
    default_dir = os.path.join(os.path.dirname(__file__), "..", "knowledge-base", "public")
    scan_dir = sys.argv[1] if len(sys.argv) > 1 else default_dir
    access_level = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_ACCESS_LEVEL
    main(scan_dir, access_level)