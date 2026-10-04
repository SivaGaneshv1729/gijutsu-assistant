with open('ai-service/app/api/routes.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines[90:130]):
        print(f"{i+90}: {line.strip()}")
