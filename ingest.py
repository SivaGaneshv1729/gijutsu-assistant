import requests

url = "http://localhost:8000/api/rag/ingest"
headers = {"Content-Type": "application/json"}

files = [
    {
        "filename": "progit.pdf",
        "original_filename": "12345678-1234-1234-1234-123456789012",
        "access_level": "ENGINEER"
    }
]

for payload in files:
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"File: {payload['filename']} - Status: {response.status_code}")
        print("Response:", response.json())
    except Exception as e:
        print(f"Failed to post {payload['filename']}:", e)
