with open("frontend/src/App.tsx", "r", encoding="utf-8") as f:
    app_text = f.read()

# Remove unused imports from App.tsx
app_text = app_text.replace("import KnowledgeGraph from './pages/KnowledgeGraph';\n", "")
app_text = app_text.replace("import Analytics from './pages/Analytics';\n", "")
if "import AdminPanel from './pages/AdminPanel';\n" in app_text:
    app_text = app_text.replace("import AdminPanel from './pages/AdminPanel';\n", "")

with open("frontend/src/App.tsx", "w", encoding="utf-8") as f:
    f.write(app_text)


with open("frontend/src/pages/Copilot.tsx", "r", encoding="utf-8") as f:
    copilot_text = f.read()

# Fix isActive to active
copilot_text = copilot_text.replace("isActive={currentView === 'graph'}", "active={currentView === 'graph'}")
copilot_text = copilot_text.replace("isActive={currentView === 'analytics'}", "active={currentView === 'analytics'}")
copilot_text = copilot_text.replace("isActive={currentView === 'admin'}", "active={currentView === 'admin'}")

# Fix SidebarItem declaration to use active
copilot_text = copilot_text.replace("isActive?: boolean", "active?: boolean")
copilot_text = copilot_text.replace("${isActive ?", "${active ?")

# Let's check why it said KnowledgeGraph is never read in Copilot.tsx
# The replace logic was:
# text = text[:start_chat_feed] + new_chat_block + text[end_chat_input:]
# Wait, let me just replace the whole file properly if it failed!

with open("frontend/src/pages/Copilot.tsx", "w", encoding="utf-8") as f:
    f.write(copilot_text)

