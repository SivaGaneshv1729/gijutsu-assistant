import os
import re

def patch(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        if old not in content:
            print(f"Warning: Missing substring in {path}")
        content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched {path}")

# AI Routes
patch('ai-service/app/api/routes.py', [
    ("class QueryRequest(BaseModel):\n    query: str = Field(min_length=1, max_length=MAX_QUERY_LENGTH)\n    access_level: Optional[str] = \"ENGINEER\"\n    language: str = \"en\"",
     "class QueryRequest(BaseModel):\n    query: str = Field(min_length=1, max_length=MAX_QUERY_LENGTH)\n    access_level: Optional[str] = \"ENGINEER\"\n    language: str = \"en\"\n    document_ids: Optional[List[str]] = None"),
    ("result = orchestrator.query(\n            user_question=request.query,\n            access_level=request.access_level,\n            language=request.language\n        )",
     "result = orchestrator.query(\n            user_question=request.query,\n            access_level=request.access_level,\n            language=request.language,\n            document_ids=request.document_ids\n        )")
])

# Orchestrator
patch('ai-service/app/rag/orchestrator.py', [
    ("def query(self, user_question: str, access_level: str = \"OPERATOR\", language: str = \"en\") -> Dict[str, Any]:",
     "def query(self, user_question: str, access_level: str = \"OPERATOR\", language: str = \"en\", document_ids: List[str] = None) -> Dict[str, Any]:"),
    ("def _execute_subtask(self, subtask: str, access_level: str) -> Dict[str, Any]:",
     "def _execute_subtask(self, subtask: str, access_level: str, document_ids: List[str] = None) -> Dict[str, Any]:"),
    ("chunks = self.retriever.retrieve(subtask, access_level=access_level, top_k=4)\n        external = get_external_context(subtask, max_results=1)",
     "chunks = self.retriever.retrieve(subtask, access_level=access_level, top_k=4, document_ids=document_ids)\n        external = get_external_context(subtask, max_results=1) if not document_ids else {'text': '', 'images': []}"),
    ("result = self._execute_subtask(subtask, access_level)",
     "result = self._execute_subtask(subtask, access_level, document_ids)"),
    ("all_chunks = self.retriever.retrieve(user_question, access_level=access_level, top_k=8)",
     "all_chunks = self.retriever.retrieve(user_question, access_level=access_level, top_k=8, document_ids=document_ids)"),
    ("external_data = get_external_context(user_question, max_results=2)",
     "external_data = get_external_context(user_question, max_results=2) if not document_ids else {'text': '', 'images': []}")
])

# Retriever
with open('ai-service/app/rag/hybrid_retriever.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('def retrieve(self, query: str, access_level: str = "OPERATOR", top_k: int = 5) -> List[Dict]:', 'def retrieve(self, query: str, access_level: str = "OPERATOR", top_k: int = 5, document_ids: List[str] = None) -> List[Dict]:')
c = c.replace('dense_results = self._dense_search(query_embedding, access_level, top_k=top_k * 2)', 'dense_results = self._dense_search(query_embedding, access_level, top_k=top_k * 2, document_ids=document_ids)')
c = c.replace('keyword_results = self._keyword_search(query, access_level, top_k=top_k * 2)', 'keyword_results = self._keyword_search(query, access_level, top_k=top_k * 2, document_ids=document_ids)')
c = c.replace('def _dense_search(self, query_embedding: List[float], access_level: str, top_k: int = 10) -> List[Dict]:', 'def _dense_search(self, query_embedding: List[float], access_level: str, top_k: int = 10, document_ids: List[str] = None) -> List[Dict]:')
c = c.replace('def _keyword_search(self, query: str, access_level: str, top_k: int = 10) -> List[Dict]:', 'def _keyword_search(self, query: str, access_level: str, top_k: int = 10, document_ids: List[str] = None) -> List[Dict]:')
c = c.replace('''        sql = text(f"""
            SELECT dc.id AS chunk_id,
                   dc.content AS content,
                   d.name AS doc_name,
                   d.access_level AS access_level,
                   dc.metadata_json AS metadata_json,
                   dc.page_number AS page_number
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.access_level IN ({level_placeholders})
            ORDER BY dc.embedding <=> '{vector_literal}'
            LIMIT :top_k
        """)''', '''        doc_filter = ""
        if document_ids:
            doc_filter = "AND d.id IN :doc_ids"
            level_params["doc_ids"] = tuple(document_ids)

        sql = text(f"""
            SELECT dc.id AS chunk_id,
                   dc.content AS content,
                   d.name AS doc_name,
                   d.access_level AS access_level,
                   dc.metadata_json AS metadata_json,
                   dc.page_number AS page_number
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.access_level IN ({level_placeholders})
            {doc_filter}
            ORDER BY dc.embedding <=> '{vector_literal}'
            LIMIT :top_k
        """)''')
c = c.replace('''        permitted = self._get_permitted_levels(access_level)
        search_body = {
            "size": top_k,
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": query,
                                "fields": ["content^3", "doc_name^2", "section"],
                                "type": "best_fields",
                                "fuzziness": "AUTO"
                            }
                        }
                    ],
                    "filter": [
                        {"terms": {"access_level": permitted}}
                    ]
                }
            }
        }''', '''        permitted = self._get_permitted_levels(access_level)
        
        filter_clause = [{"terms": {"access_level": permitted}}]
        if document_ids:
            filter_clause.append({"terms": {"document_id": document_ids}})

        search_body = {
            "size": top_k,
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": query,
                                "fields": ["content^3", "doc_name^2", "section"],
                                "type": "best_fields",
                                "fuzziness": "AUTO"
                            }
                        }
                    ],
                    "filter": filter_clause
                }
            }
        }''')
with open('ai-service/app/rag/hybrid_retriever.py', 'w', encoding='utf-8') as f:
    f.write(c)
print("Patched retriever")

# Java RagRequest
patch('backend/src/main/java/com/mei/rag/RagRequest.java', [
    ('public class RagRequest {', 'import java.util.List;\n\npublic class RagRequest {'),
    ('private String language;', 'private String language;\n    private List<String> documentIds;'),
    ('public void setLanguage(String language) {\n        this.language = language;\n    }', 'public void setLanguage(String language) {\n        this.language = language;\n    }\n\n    public List<String> getDocumentIds() {\n        return documentIds;\n    }\n\n    public void setDocumentIds(List<String> documentIds) {\n        this.documentIds = documentIds;\n    }')
])

# Java RagService
patch('backend/src/main/java/com/mei/rag/RagService.java', [
    ('"language", request.getLanguage()', '"language", request.getLanguage(),\n                    "document_ids", request.getDocumentIds()')
])

# api.ts
patch('frontend/src/services/api.ts', [
    ('export async function sendChatMessage(sessionId: string, query: string, language?: string): Promise<ChatMessage> {',
     'export async function sendChatMessage(sessionId: string, query: string, language?: string, documentIds?: string[]): Promise<ChatMessage> {'),
    ('body: JSON.stringify({ query, language }),',
     'body: JSON.stringify({ query, language, documentIds }),')
])

# Copilot.tsx
with open('frontend/src/pages/Copilot.tsx', 'r', encoding='utf-8') as f:
    cop = f.read()
cop = cop.replace('const [focusedDocId, setFocusedDocId] = useState<string | null>(null);', 'const [focusedDocIds, setFocusedDocIds] = useState<string[]>([]);')
cop = cop.replace('const msg = await sendChatMessage(sessionId, query, language);', 'const msg = await sendChatMessage(sessionId, query, language, focusedDocIds.length > 0 ? focusedDocIds : undefined);')

old_ui = '''        {/* Focused Document Mode */}
        <div className="px-3 mb-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold px-3 mb-2 shrink-0 flex items-center gap-2"><BookOpen size={10}/> Focused Doc</div>
          <div className="space-y-0.5 max-h-40 overflow-y-auto no-scrollbar">
            <div
              onClick={() => setFocusedDocId(null)}
              className={lex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors }
            >
              <Filter size={10}/> All Documents
            </div>
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                onClick={() => setFocusedDocId(doc.id)}
                className={lex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors }
              >
                <FileText size={10} className="shrink-0"/>
                <span className="truncate">{doc.name || doc.filename || doc.id}</span>
              </div>
            ))}
          </div>
        </div>'''

new_ui = '''        {/* Focused Document Mode */}
        <div className="px-3 mb-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold px-3 mb-2 shrink-0 flex items-center gap-2"><BookOpen size={10}/> Focused Docs</div>
          <div className="space-y-0.5 max-h-40 overflow-y-auto no-scrollbar">
            <div
              onClick={() => setFocusedDocIds([])}
              className={lex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors }
            >
              <Filter size={10}/> All Documents
            </div>
            {documents.map((doc: any) => {
              const isSelected = focusedDocIds.includes(doc.id);
              return (
              <div
                key={doc.id}
                onClick={() => setFocusedDocIds(prev => isSelected ? prev.filter(id => id !== doc.id) : [...prev, doc.id])}
                className={lex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors }
              >
                <div className={w-3 h-3 rounded-sm flex items-center justify-center shrink-0 border }>
                  {isSelected ? <Check size={8} /> : null}
                </div>
                <FileText size={10} className="shrink-0"/>
                <span className="truncate">{doc.name || doc.filename || doc.id}</span>
              </div>
            )})}
          </div>
        </div>'''

cop = cop.replace(old_ui, new_ui)
with open('frontend/src/pages/Copilot.tsx', 'w', encoding='utf-8') as f:
    f.write(cop)
print("Copilot.tsx patched.")
