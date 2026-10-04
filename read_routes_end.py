with open('ai-service/app/api/routes.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines[140:190]):
        print(f"{i+140}: {line.rstrip()}")
