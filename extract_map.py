import re
with open('frontend/src/pages/Copilot.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'messages\.map\(\(m(?:essage)?.*?\)(.*?)\)(?:;|})', content, re.DOTALL)
if match:
    print(content[match.start():match.start()+1500])
else:
    print("messages.map not found.")
