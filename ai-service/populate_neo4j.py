import asyncio
import os
import psycopg2
from neo4j import AsyncGraphDatabase

POSTGRES_URL = "postgresql://postgres:postgres@postgres:5432/mei_platform"
NEO4J_URI = "bolt://neo4j:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"

async def sync():
    conn = psycopg2.connect(POSTGRES_URL)
    cur = conn.cursor()
    cur.execute("SELECT id, name, type, access_level FROM documents")
    docs = cur.fetchall()
    cur.execute("SELECT id, document_id, content FROM document_chunks")
    chunks = cur.fetchall()
    conn.close()
    
    driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    async with driver.session() as session:
        for d in docs:
            # use params dictionary explicitly
            await session.run(
                "MERGE (d:Document {id: $doc_id}) SET d.name=$name, d.type=$type, d.access_level=$acc",
                doc_id=d[0], name=d[1], type=d[2] or 'MANUAL', acc=d[3] or 'ADMIN'
            )
            entities = [
                {"name": "Ironhorse Motor", "type": "Hardware"},
                {"name": "Voltage Spec", "type": "Parameter"},
                {"name": "Maintenance Protocol", "type": "Procedure"}
            ]
            await session.run("""
                MATCH (d:Document {id: $doc_id})
                UNWIND $entities AS e
                MERGE (ent:Entity {name: e.name, type: e.type})
                MERGE (d)-[:MENTIONS]->(ent)
            """, doc_id=d[0], entities=entities)
            
        for c in chunks:
            await session.run("""
                MATCH (d:Document {id: $doc_id})
                MERGE (ch:Chunk {id: $chunk_id})
                SET ch.text = $text
                MERGE (d)-[:HAS_CHUNK]->(ch)
            """, doc_id=c[1], chunk_id=c[0], text=c[2][:50] + "...")
            
    await driver.close()
    print("Sync complete.")

asyncio.run(sync())
