with open('frontend/src/pages/Analytics.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines[50:110]):
        print(f"{i+50}: {line.rstrip()}")
