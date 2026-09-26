with open('frontend/src/pages/KnowledgeGraph.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { ForceGraph2D } from 'react-force-graph';", "import ForceGraph2D from 'react-force-graph-2d';")

with open('frontend/src/pages/KnowledgeGraph.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
