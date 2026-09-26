import os

path = 'backend/src/main/java/com/mei/rag/RagService.java'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'requestBody.put("access_level", accessLevel);',
    'requestBody.put("access_level", accessLevel);\n        requestBody.put("language", ragRequest.getLanguage());\n        requestBody.put("document_ids", ragRequest.getDocumentIds());'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("RagService.java patched.")
