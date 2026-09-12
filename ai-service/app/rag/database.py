import os
from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("POSTGRES_URL", "postgresql://postgres:postgres@localhost:5432/mei_platform")
# Fix JDBC url to SQLAlchemy url format if needed
if DATABASE_URL.startswith("jdbc:postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("jdbc:postgresql://", "postgresql://")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DocumentChunkModel(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, index=True)
    content = Column(String)
    page_number = Column(Integer, nullable=True)
    section = Column(String, nullable=True)
    access_level = Column(String, index=True)
    metadata_json = Column(JSONB, nullable=True)
    embedding = Column(Vector(384)) # Using 384 dimensions for all-MiniLM-L6-v2

def init_db():
    # Install pgvector extension if not exists
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
