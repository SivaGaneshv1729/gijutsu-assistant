import asyncio
import os
import psycopg2
from neo4j import AsyncGraphDatabase

POSTGRES_URL = "postgresql://postgres:postgres@localhost:5432/mei_platform"
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"

async def sync():
    print("Connecting to postgres...")
    # Since we are running on host, we need to connect to localhost ports mapped in docker
    conn = psycopg2.connect(POSTGRES_URL)
    cur = conn.cursor()
    
    cur.execute("SELECT id, name, type, access_level FROM documents")
    docs = cur.fetchall()
    
    cur.execute("SELECT id, document_id, content FROM document_chunks")
    chunks = cur.fetchall()
    
    conn.close()
    
    print(f"Found {len(docs)} docs, {len(chunks)} chunks.")
    
    driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    async with driver.session() as session:
        for d in docs:
            print(f"Syncing doc: {d[1]}")
            await session.run(
                "MERGE (d:Document {id: }) SET d.name=, d.type=, d.access_level=",
                id=d[0], name=d[1], type=d[2], acc=d[3]
            )
            
            # Extract some fake entities for the visual graph
            entities = [
                {"name": "Ironhorse Motor", "type": "Hardware"},
                {"name": "Voltage Spec", "type": "Parameter"},
                {"name": "Maintenance Protocol", "type": "Procedure"}
            ]
            await session.run("""
                MATCH (d:Document {id: })
                UNWIND  AS e
                MERGE (ent:Entity {name: e.name, type: e.type})
                MERGE (d)-[:MENTIONS]->(ent)
            """, id=d[0], entities=entities)
            
        print("Syncing chunks...")
        for c in chunks:
            await session.run("""
                MATCH (d:Document {id: })
                MERGE (ch:Chunk {id: })
                SET ch.text = 
                MERGE (d)-[:HAS_CHUNK]->(ch)
            """, doc_id=c[1], chunk_id=c[0], text=c[2][:50] + "...")
            
    await driver.close()
    print("Sync complete.")

asyncio.run(sync())
