import requests

url = "http://localhost:8000/api/rag/ingest"
payload = {
    "filename": "ironhorsedcm.pdf",
    "original_filename": "ironhorsedcm.pdf"
}

try:
    print("Ingesting PDF: ironhorsedcm.pdf...")
    response = requests.post(url, json=payload, timeout=600)
    print("Status Code:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
