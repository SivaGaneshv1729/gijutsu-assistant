import os

file_path = r'frontend/src/pages/Copilot.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_user = '''className="px-5 py-3 rounded-2xl bg-indigo-600 text-white max-w-[85%] border border-indigo-500 shadow-sm"'''
replace_user = '''className="px-5 py-3 rounded-2xl bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 text-white max-w-[85%] shadow-[0_0_15px_rgba(59,130,246,0.15)]"'''

target_assistant = '''className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 w-full"'''
replace_assistant = '''className="px-6 py-4 rounded-2xl bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 text-slate-200 w-full shadow-[0_4px_30px_rgba(0,0,0,0.3)]"'''

content = content.replace(target_user, replace_user)
content = content.replace(target_assistant, replace_assistant)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Message bubble glassmorphism applied successfully.')
