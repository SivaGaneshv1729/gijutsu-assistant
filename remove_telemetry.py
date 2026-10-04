import os
import re

file_path = r'frontend/src/pages/Analytics.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change grid cols from 4 to 3
content = content.replace('lg:grid-cols-4', 'lg:grid-cols-3')

# Remove the Right Column section
target_right_col = '''        {/* Right Column: Telemetry */}
        <div className="lg:col-span-1 h-full">
           <TelemetryFeed />
        </div>'''
content = content.replace(target_right_col, '')

# We can leave the TelemetryFeed component definition there as dead code to be safe,
# or we can try to strip it out using regex. But just removing it from the JSX is enough for the UI to not show it.
# To be clean, I'll remove the component definition.
content = re.sub(r'// Live Telemetry Generator.*?const NodeStatus', 'const NodeStatus', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Telemetry removed successfully.')
