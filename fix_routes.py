import re

with open('ai-service/app/api/routes.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''        db.commit()
        return {"status": "success", "chunks_processed": len(chunks)}'''

replace = '''        db.commit()

        # Bug Fix: Ensure Neo4j graph is synchronized with the new document and chunks
        try:
            import asyncio
            from app.graph.neo4j_store import get_knowledge_graph
            
            async def update_neo4j():
                kg = await get_knowledge_graph()
                doc_name = request.filename
                doc_id = request.original_filename
                access_level = request.access_level.upper() if request.access_level else "ADMIN"
                await kg.create_document_node(doc_id, doc_name, "MANUAL", access_level)
                
                n4j_chunks = []
                for c in chunks:
                    n4j_chunks.append({
                        "id": str(uuid.uuid4()),
                        "text": c["text"][:100] + "...",
                        "position": c["page_number"]
                    })
                await kg.create_chunk_nodes(doc_id, n4j_chunks)
            
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(update_neo4j())
            except RuntimeError:
                asyncio.run(update_neo4j())
        except Exception as e:
            print("Warning: Failed to sync with Neo4j:", e)
            
        return {"status": "success", "chunks_processed": len(chunks)}'''

content = content.replace(target, replace)

with open('ai-service/app/api/routes.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("routes.py Neo4j sync bug fixed.")
