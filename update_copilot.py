import os

file_path = r'frontend/src/pages/Copilot.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''          const qLower = query.toLowerCase();
          if (qLower.includes('motor') || qLower.includes('pump')) {
              msg.content = "Here is the 3D interactive prototype you requested:\\n\\n`3dmodel\\n" + 
(qLower.includes('motor') ? 'motor' : 'pump') + "\\n`\\n\\n" + msg.content;
          }'''

replace = '''          const qLower = query.toLowerCase();
          const triggerWords = ['motor', 'pump', 'machine', 'prototype', '3d', 'visual', 'hardware', 'part'];
          if (triggerWords.some(w => qLower.includes(w))) {
              const type = qLower.includes('pump') ? 'pump' : 'motor';
              msg.content = "Here is the 3D interactive prototype you requested:\\n\\n`3dmodel\\n" + type + "\\n`\\n\\n" + msg.content;
          }'''

content = content.replace(target, replace)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Copilot.tsx updated successfully.')
