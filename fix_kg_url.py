import os

file_path = r'frontend/src/pages/KnowledgeGraph.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''const res = await fetch(${API_BASE}/api/knowledge/graph,'''
replace = '''const res = await fetch(${API_BASE}/api/rag/graph,'''

# Note: The backticks and variables are string literals in the python script. 
# We need to be careful with string interpolation in Python.
target = "const res = await fetch(${API_BASE}/api/knowledge/graph,"
replace = "const res = await fetch(${API_BASE}/api/rag/graph,"

content = content.replace(target, replace)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('KnowledgeGraph URL updated successfully.')
