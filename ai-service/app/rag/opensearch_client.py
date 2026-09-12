from opensearchpy import OpenSearch
import os

class OpenSearchManager:
    def __init__(self):
        host = os.getenv("OPEN_SEARCH_URL", "http://localhost:9200")
        password = os.getenv("OPENSEARCH_PASSWORD", "StrongPassword123!")
        
        # Remove http:// or https:// for opensearch-py client config if needed, or pass as single node URL
        self.client = OpenSearch(
            hosts=[host],
            http_auth=('admin', password),
            use_ssl=False,
            verify_certs=False
        )
        self.index_name = "document_chunks"

    def init_index(self):
        if not self.client.indices.exists(index=self.index_name):
            index_body = {
                "settings": {
                    "index": {
                        "number_of_shards": 1,
                        "number_of_replicas": 0
                    }
                },
                "mappings": {
                    "properties": {
                        "chunk_id": {"type": "keyword"},
                        "document_id": {"type": "keyword"},
                        "content": {"type": "text"},
                        "section": {"type": "keyword"},
                        "access_level": {"type": "keyword"}
                    }
                }
            }
            self.client.indices.create(index=self.index_name, body=index_body)

    def search(self, query: str, access_level: str, top_k: int = 10):
        # We need a proper RBAC matching system, but for now we'll match exact or lower. 
        # In a real system, roles would map to a hierarchy. 
        # For simplicity, we just filter by the specific access level here, 
        # or we rely on the caller to provide all permitted levels.
        # Assuming access_level is a list of allowed levels passed as space separated string or similar
        search_body = {
            "size": top_k,
            "query": {
                "bool": {
                    "must": [
                        {"match": {"content": query}}
                    ],
                    "filter": [
                        # {"terms": {"access_level": allowed_levels}} # Proper RBAC implementation later
                    ]
                }
            }
        }
        return self.client.search(index=self.index_name, body=search_body)

os_manager = OpenSearchManager()
