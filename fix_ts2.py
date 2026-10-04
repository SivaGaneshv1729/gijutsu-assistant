import re

# Fix KnowledgeGraph.tsx
with open('frontend/src/pages/KnowledgeGraph.tsx', 'r', encoding='utf-8') as f:
    kg = f.read()

# Just remove the property nodeCanvasObject={paintNode}
kg = kg.replace("nodeCanvasObject={paintNode}", "")

with open('frontend/src/pages/KnowledgeGraph.tsx', 'w', encoding='utf-8') as f:
    f.write(kg)
