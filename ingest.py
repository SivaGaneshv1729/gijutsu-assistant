import requests

url = "http://localhost:8000/api/rag/ingest"
headers = {"Content-Type": "application/json"}

files = [
    {
        "filename": "809f453ac4b8a58f6c58c2cc717800244001a30b0fc9eb263a3c695793f92645.pdf",
        "original_filename": "809f453a-c4b8-a58f-6c58-c2cc71780024",
        "access_level": "ENGINEER"
    },
    {
        "filename": "f7e3d745b841b8569bdf5a152d6f015ddf757012c80144e7c99c08c6be427be4.pdf",
        "original_filename": "f7e3d745-b841-b856-9bdf-5a152d6f015d",
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
