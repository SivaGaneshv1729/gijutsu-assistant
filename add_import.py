import os
file_path = r'frontend/src/pages/Copilot.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import { ModelViewer } from '../components/ModelViewer';\n"
if "import { ModelViewer }" not in content:
    content = content.replace("import { MermaidRenderer } from '../components/MermaidRenderer';", "import { MermaidRenderer } from '../components/MermaidRenderer';\n" + import_statement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)