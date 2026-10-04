import glob

for filepath in glob.glob('ai-service/app/**/*.py', recursive=True):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                if 'add_document' in line or 'add_chunks' in line or 'add_entities' in line:
                    print(f"{filepath}:{i+1}: {line.strip()}")
    except:
        pass
