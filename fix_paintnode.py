import re

with open('frontend/src/pages/KnowledgeGraph.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the paintNode function
content = re.sub(r'const paintNode\s*=\s*\([^\)]*\)\s*=>\s*\{[^}]+\};', '', content, flags=re.DOTALL)
# In case it has nested braces, let's just use string replace if possible.
# I'll just write a quick script that finds 'const paintNode' and removes lines until '};'
lines = content.split('\n')
new_lines = []
skip = False
for line in lines:
    if 'const paintNode' in line:
        skip = True
    if not skip:
        new_lines.append(line)
    if skip and line.strip() == '};':
        skip = False

with open('frontend/src/pages/KnowledgeGraph.tsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))
