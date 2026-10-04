import uuid
import os
import shutil
import requests

# Generate a UUID
doc_id = str(uuid.uuid4())
new_filename = f"{doc_id}.pdf"

# Copy the file to the UUID name
src = "dataset/ironhorsedcm.pdf"
dst = f"dataset/{new_filename}"
shutil.copy(src, dst)

url = "http://localhost:8000/api/rag/ingest"
payload = {
    "filename": new_filename,
    "original_filename": "ironhorsedcm.pdf"
}

try:
    print(f"Ingesting PDF: {new_filename} (ironhorsedcm.pdf)...")
    response = requests.post(url, json=payload, timeout=600)
    print("Status Code:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
