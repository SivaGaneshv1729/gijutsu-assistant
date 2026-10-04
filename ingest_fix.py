import uuid
import requests

url = "http://localhost:8000/api/rag/ingest"
payload = {
    "filename": "ironhorsedcm.pdf",
    "original_filename": str(uuid.uuid4())
}

try:
    print(f"Ingesting PDF: ironhorsedcm.pdf with UUID as original_filename...")
    response = requests.post(url, json=payload, timeout=600)
    print("Status Code:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
