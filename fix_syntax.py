import re
with open('frontend/src/pages/Analytics.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = 'className={p-4 rounded-xl bg-white/5 border  transition-all duration-300 group cursor-pointer hover:-translate-y-1}'
replace = 'className={"p-4 rounded-xl bg-white/5 border " + activeStyle + " transition-all duration-300 group cursor-pointer hover:-translate-y-1"}'
content = content.replace(target, replace)

with open('frontend/src/pages/Analytics.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
