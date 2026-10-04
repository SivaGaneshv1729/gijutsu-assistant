import re

# 1. Fix KnowledgeGraph.tsx
with open('frontend/src/pages/KnowledgeGraph.tsx', 'r', encoding='utf-8') as f:
    kg_content = f.read()

# Remove nodeCanvasObject completely or replace with a simple node color function
# Since 3D nodes are spheres by default, we just need to remove nodeCanvasObject
kg_content = re.sub(r'nodeCanvasObject=\{.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\}', '', kg_content, flags=re.DOTALL)
# Also just in case it's a single line or different formatting, let's remove any nodeCanvasObject={...}
kg_content = re.sub(r'nodeCanvasObject=\{[^\}]+\}', '', kg_content)
# Let's ensure nodeCanvasObject is removed completely
kg_content = re.sub(r'nodeCanvasObject=\{[^\}]*\}[^\}]*\}', '', kg_content) # Try to match nested? No, regex on JS is hard.

# Let's just use string replace for the specific block if we can't regex it.
# Actually, I'll print the nodeCanvasObject block first to be safe, or just do a regex that removes the prop.

