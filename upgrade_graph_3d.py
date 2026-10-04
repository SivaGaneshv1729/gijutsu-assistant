import re

with open('frontend/src/pages/KnowledgeGraph.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace ForceGraph2D with ForceGraph3D
content = content.replace("import ForceGraph2D from 'react-force-graph-2d';", "import ForceGraph3D from 'react-force-graph-3d';")
content = content.replace("<ForceGraph2D", "<ForceGraph3D")
content = content.replace("</ForceGraph2D>", "</ForceGraph3D>")

# Add some nice 3D properties to the ForceGraph3D component
target_props = '''ref={fgRef}
              graphData={graphData}'''

replace_props = '''ref={fgRef}
              graphData={graphData}
              backgroundColor="#030712"
              nodeResolution={16}
              linkResolution={6}
              nodeOpacity={0.9}
              linkOpacity={0.3}'''
content = content.replace(target_props, replace_props)

with open('frontend/src/pages/KnowledgeGraph.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("KnowledgeGraph upgraded to 3D successfully.")
