import os
file_path = r'frontend/src/pages/Copilot.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
pattern = re.compile(r"if \(!inline && match && match\[1\] === 'mermaid'\) \{\s*return <MermaidRenderer chart=\{String\(children\)\.replace\(/\\n\$\/, ''\)\} />;\s*\}")
replacement = r"""if (!inline && match) {
                if (match[1] === 'mermaid') {
                  return <MermaidRenderer chart={String(children).replace(/\\n$/, '')} />;
                }
                if (match[1] === '3dmodel') {
                  return <ModelViewer type={String(children).replace(/\\n$/, '')} />;
                }
              }"""

content = pattern.sub(replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)