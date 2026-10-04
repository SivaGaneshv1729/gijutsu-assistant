import re

with open('frontend/src/pages/KnowledgeGraph.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import ForceGraph2D from 'react-force-graph-2d';", "import ForceGraph3D from 'react-force-graph-3d';")
content = content.replace("<ForceGraph2D", "<ForceGraph3D")
content = content.replace("</ForceGraph2D>", "</ForceGraph3D>")

# Add 3D props if they are missing
if 'backgroundColor=' not in content:
    target_props = 'graphData={graphData}'
    replace_props = 'graphData={graphData}\n              backgroundColor="#030712"\n              nodeResolution={16}\n              linkResolution={6}\n              nodeOpacity={0.9}\n              linkOpacity={0.3}'
    content = content.replace(target_props, replace_props)

with open('frontend/src/pages/KnowledgeGraph.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Upgraded to ForceGraph3D.")
