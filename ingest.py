import requests

url = "http://localhost:8000/api/rag/ingest"
payload = {
    "filename": "machine_manual.md",
    "original_filename": "123e4567-e89b-12d3-a456-426614174000",
    "access_level": "ENGINEER"
}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print("Status Code:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Failed to post:", e)
