import os
import glob

search_terms = ['CREATE', 'MERGE', 'session.run', 'tx.run']
for filepath in glob.glob('ai-service/app/**/*.py', recursive=True):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                if any(term in line for term in search_terms):
                    print(f"{filepath}:{i+1}: {line.strip()}")
    except:
        pass
