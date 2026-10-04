import os
import glob
from pathlib import Path

exts = ['.csv', '.json', '.pdf']
skip_dirs = {'node_modules', '.git', 'venv', '.vite'}

recent_files = []

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in skip_dirs]
    for file in files:
        if any(file.endswith(ext) for ext in exts):
            path = os.path.join(root, file)
            recent_files.append((path, os.path.getmtime(path)))

recent_files.sort(key=lambda x: x[1], reverse=True)
for path, mtime in recent_files[:10]:
    print(path)
