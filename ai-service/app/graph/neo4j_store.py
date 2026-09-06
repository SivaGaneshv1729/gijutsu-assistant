import logging
import os
from typing import Any, Dict, List, Optional

from neo4j import AsyncGraphDatabase

logger = logging.getLogger(__name__)

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")


class KnowledgeGraph:
    """Neo4j-backed knowledge graph for entity relationships and document linking."""

    def __init__(self):
        self._driver = None

    async def connect(self):
        if self._driver is None:
            self._driver = AsyncGraphDatabase.driver(
                NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)
            )
            await self._driver.verify_connectivity()
            logger.info("Connected to Neo4j at %s", NEO4J_URI)

    async def close(self):
        if self._driver:
            await self._driver.close()
            self._driver = None

    async def create_document_node(self, doc_id: str, name: str, doc_type: str, access_level: str) -> None:
        """Create or update a document node in the graph."""
        await self.connect()
        query = """
        MERGE (d:Document {id: $doc_id})
        SET d.name = $name, d.type = $doc_type, d.access_level = $access_level
        """
        async with self._driver.session() as session:
            await session.run(query, doc_id=doc_id, name=name, doc_type=doc_type, access_level=access_level)

    async def create_entity_nodes(self, doc_id: str, entities: List[Dict[str, str]]) -> None:
        """Create entity nodes and link them to a document."""
        await self.connect()
        query = """
        MATCH (d:Document {id: $doc_id})
        UNWIND $entities AS entity
        MERGE (e:Entity {name: entity.name, type: entity.type})
        MERGE (d)-[:MENTIONS]->(e)
        """
        async with self._driver.session() as session:
            await session.run(query, doc_id=doc_id, entities=entities)

    async def create_chunk_nodes(self, doc_id: str, chunks: List[Dict[str, Any]]) -> None:
        """Create chunk nodes and link them to a document."""
        await self.connect()
        query = """
        MATCH (d:Document {id: $doc_id})
        UNWIND $chunks AS chunk
        MERGE (c:Chunk {id: chunk.id})
        SET c.text = chunk.text, c.position = chunk.position
        MERGE (d)-[:HAS_CHUNK]->(c)
        """
        async with self._driver.session() as session:
            await session.run(query, doc_id=doc_id, chunks=chunks)

    async def find_related_documents(self, doc_name: str, depth: int = 2) -> List[Dict[str, Any]]:
        """Find documents related through shared entities up to a given depth."""
        await self.connect()
        query = """
        MATCH (d:Document {name: $doc_name})-[:MENTIONS]->(e:Entity)<-[:MENTIONS]-(related:Document)
        RETURN DISTINCT related.name AS name, related.type AS type, count(e) AS shared_entities
        ORDER BY shared_entities DESC
        LIMIT 10
        """
        async with self._driver.session() as session:
            result = await session.run(query, doc_name=doc_name)
            return [dict(record) async for record in result]

    async def get_entity_context(self, entity_name: str) -> List[Dict[str, Any]]:
        """Get all documents mentioning a specific entity."""
        await self.connect()
        query = """
        MATCH (e:Entity {name: $entity_name})<-[:MENTIONS]-(d:Document)
        RETURN d.name AS name, d.type AS type, d.access_level AS access_level
        """
        async with self._driver.session() as session:
            result = await session.run(query, entity_name=entity_name)
            return [dict(record) async for record in result]

    async def get_graph_stats(self) -> Dict[str, int]:
        """Get node and relationship counts."""
        await self.connect()
        stats = {}
        async with self._driver.session() as session:
            for label in ["Document", "Entity", "Chunk"]:
                result = await session.run(f"MATCH (n:{label}) RETURN count(n) AS count")
                record = await result.single()
                stats[label.lower() + "s"] = record["count"]
            result = await session.run("MATCH ()-[r]->() RETURN count(r) AS count")
            record = await result.single()
            stats["relationships"] = record["count"]
        return stats

    async def delete_document_graph(self, doc_id: str) -> None:
        """Remove a document and its orphaned relationships from the graph."""
        await self.connect()
        query = """
        MATCH (d:Document {id: $doc_id})
        DETACH DELETE d
        """
        async with self._driver.session() as session:
            await session.run(query, doc_id=doc_id)


_kg: Optional[KnowledgeGraph] = None


async def get_knowledge_graph() -> KnowledgeGraph:
    global _kg
    if _kg is None:
        _kg = KnowledgeGraph()
    return _kg
