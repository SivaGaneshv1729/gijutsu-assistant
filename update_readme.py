with open('README.md', 'r', encoding='utf-8') as f:
    content = f.read()

v3_updates = """
## 🚀 Recent Updates (v3.0 - The Cognitive & 3D Update)
- **Advanced Cognitive AI Assistant**: Injected 5-stage Chain-of-Thought reasoning into the RAG orchestrator, forcing the AI to validate confidence, check for contradictions, and use bulleted syntax before responding.
- **Voice Commands (TTS/STT)**: Integrated the Web Speech API directly into the Copilot. Users can now speak to the AI and have the AI natively read its engineering responses back out loud with sentence-chunked synthesis.
- **3D Knowledge Graph**: Upgraded the standard 2D node map to a fully interactive eact-force-graph-3d visualization, letting you fly through interconnected hardware, protocols, and documents in three dimensions.
- **Interactive 3D Hardware Dashboard**: The telemetry nodes in the Analytics dashboard are now fully clickable and interactively swap the embedded 3D WebGL models (e.g., Motors vs Pumps) in real time.
- **Full Multilingual Localization (UTF-8)**: Implemented complete, context-aware Japanese translations across the UI for seamless international factory deployment.
- **Zero-Latency Graph Sync**: Fixed the ingestion pipeline so documents uploaded via the Admin Gateway instantly spin up corresponding Document and Entity nodes inside the Neo4j Graph Database.

## ✨ Previous Updates (v2.0)"""

content = content.replace("## 🚀 Recent Updates (v2.0)", v3_updates)

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("README.md updated.")
