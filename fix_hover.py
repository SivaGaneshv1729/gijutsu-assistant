import re

with open('frontend/src/pages/KnowledgeGraph.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove hoverNode state
content = re.sub(r'const\s*\[\s*hoverNode\s*,\s*setHoverNode\s*\]\s*=\s*useState<any>\(null\);', '', content)
content = re.sub(r'const\s*\[\s*hoverNode\s*,\s*setHoverNode\s*\]\s*=\s*useState.*?null\);', '', content)

# Remove setHoverNode usages
content = content.replace('setHoverNode(node || null);', '')

with open('frontend/src/pages/KnowledgeGraph.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("hoverNode unused variable removed.")
