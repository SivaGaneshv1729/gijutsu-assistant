import os
from neo4j import GraphDatabase

class Neo4jManager:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))

    def close(self):
        self.driver.close()

    def get_context_for_entity(self, entity_name: str) -> str:
        """
        Retrieves graph context for a specific entity (Machine, Component, Alarm).
        For simplicity, this executes a general Cypher query looking for any node
        matching the entity name and returning its immediate neighborhood (1 hop).
        """
        query = """
        MATCH (n)-[r]-(m)
        WHERE toLower(n.name) CONTAINS toLower($entity_name)
           OR toLower(n.id) = toLower($entity_name)
        RETURN labels(n)[0] AS EntityType, n.name AS EntityName, 
               type(r) AS Relationship, 
               labels(m)[0] AS RelatedType, m.name AS RelatedName
        LIMIT 20
        """
        
        try:
            with self.driver.session() as session:
                result = session.run(query, entity_name=entity_name)
                records = list(result)
                
                if not records:
                    return ""
                
                context = f"### GRAPH CONTEXT FOR '{entity_name}' ###\n"
                for record in records:
                    context += f"- [{record['EntityType']}] {record['EntityName']} --({record['Relationship']})--> [{record['RelatedType']}] {record['RelatedName']}\n"
                return context + "\n"
        except Exception as e:
            print(f"Neo4j Error: {e}")
            return ""

neo4j_manager = Neo4jManager()
