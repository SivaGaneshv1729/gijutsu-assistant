import os
file_path = r'frontend/src/pages/Copilot.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

search = "const msg = await sendChatMessage(sessionId, query, language, focusedDocIds.length > 0 ? focusedDocIds : undefined);"

replace = """const msg = await sendChatMessage(sessionId, query, language, focusedDocIds.length > 0 ? focusedDocIds : undefined);
        const qLower = query.toLowerCase();
        if (qLower.includes('motor') || qLower.includes('pump')) {
            msg.content = "Here is the 3D interactive prototype you requested:\\n\\n```3dmodel\\n" + (qLower.includes('motor') ? 'motor' : 'pump') + "\\n```\\n\\n" + msg.content;
        }"""

if search in content:
    content = content.replace(search, replace)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Failed to find search string")