import requests

try:
    res = requests.get('http://localhost:8000/api/rag/graph')
    data = res.json()
    print(f"Nodes: {len(data.get('nodes', []))}")
    print(f"Links: {len(data.get('links', []))}")
except Exception as e:
    print('Error:', e)
