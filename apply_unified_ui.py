with open("frontend/src/pages/Copilot.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add imports for the pages
if "import KnowledgeGraph" not in text:
    text = text.replace("import ReactMarkdown from 'react-markdown';", "import ReactMarkdown from 'react-markdown';\nimport KnowledgeGraph from './KnowledgeGraph';\nimport Analytics from './Analytics';\nimport AdminPanel from './AdminPanel';")

# Add useLocation to react-router-dom import
text = text.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useLocation } from 'react-router-dom';")

# Get currentView inside Copilot component
if "const currentView =" not in text:
    text = text.replace("const { language, setLanguage, t } = useLanguage();", """const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const currentView = location.pathname.includes('/graph') ? 'graph' :
                      location.pathname.includes('/analytics') ? 'analytics' :
                      location.pathname.includes('/admin') ? 'admin' : 'chat';""")

# Hide right PDF panel if not chat
text = text.replace("{/* RIGHT SIDEBAR (PDF PANEL) */}", """{/* RIGHT SIDEBAR (PDF PANEL) */}
        {currentView === 'chat' && (""")
# Close the right sidebar block at the end
text = text.replace("{/* Settings Modal */}", """)}
        {/* Settings Modal */}""")

# Replace the chat feed area to conditionally render based on currentView
start_chat_feed = text.find("{/* Chat Feed */}")
start_chat_input = text.find("{/* Chat Input */}")

if start_chat_feed != -1 and start_chat_input != -1:
    # Find the end of the Chat Input div (before RIGHT SIDEBAR)
    end_chat_input = text.find("{/* RIGHT SIDEBAR (PDF PANEL) */}")
    
    chat_block = text[start_chat_feed:end_chat_input]
    
    new_chat_block = f"""{{currentView === 'chat' && (
            <>
              {chat_block}
            </>
          )}}
          
          {{currentView === 'graph' && (
            <div className="flex-1 w-full h-full relative overflow-hidden bg-[#09090b]">
              <KnowledgeGraph />
            </div>
          )}}

          {{currentView === 'analytics' && (
            <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar relative p-4">
              <Analytics />
            </div>
          )}}

          {{currentView === 'admin' && (
            <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar relative p-4">
              <AdminPanel />
            </div>
          )}}
"""
    text = text[:start_chat_feed] + new_chat_block + text[end_chat_input:]

# Fix sidebar navigation links (remove active classes if possible or handle properly)
text = text.replace("""<SidebarItem icon={<GitBranch size={16}/>} label="Knowledge Graph" onClick={() => navigate('/graph')} />""", """<SidebarItem icon={<GitBranch size={16}/>} label="Knowledge Graph" onClick={() => navigate('/graph')} isActive={currentView === 'graph'} />""")
text = text.replace("""<SidebarItem icon={<BarChart2 size={16}/>} label="Analytics" onClick={() => navigate('/analytics')} />""", """<SidebarItem icon={<BarChart2 size={16}/>} label="Analytics" onClick={() => navigate('/analytics')} isActive={currentView === 'analytics'} />""")
# Let's add Admin Panel to the sidebar!
text = text.replace("""<SidebarItem icon={<Settings size={16}/>} label={t("sidebar.settings")} onClick={() => setSettingsOpen(true)} />""", """<SidebarItem icon={<UploadCloud size={16}/>} label="Admin Panel" onClick={() => navigate('/admin')} isActive={currentView === 'admin'} />\n               <SidebarItem icon={<Settings size={16}/>} label={t("sidebar.settings")} onClick={() => setSettingsOpen(true)} />""")

# Add UploadCloud to lucide-react imports if missing
if "UploadCloud" not in text.split("from 'lucide-react'")[0]:
    text = text.replace("Settings, Check", "Settings, Check, UploadCloud")

# Fix SidebarItem component if it doesn't take isActive
text = text.replace("""function SidebarItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {""", """function SidebarItem({ icon, label, onClick, isActive }: { icon: React.ReactNode, label: string, onClick?: () => void, isActive?: boolean }) {""")
text = text.replace("""className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
    >""", """className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >""")


with open("frontend/src/pages/Copilot.tsx", "w", encoding="utf-8") as f:
    f.write(text)

# Also we need to make App.tsx point /admin, /analytics, /graph all to Copilot!
with open("frontend/src/App.tsx", "r", encoding="utf-8") as f:
    app_text = f.read()

app_text = app_text.replace("<KnowledgeGraph />", "<Copilot />")
app_text = app_text.replace("<Analytics />", "<Copilot />")
if "<AdminPanel />" in app_text:
    app_text = app_text.replace("<AdminPanel />", "<Copilot />")
else:
    app_text = app_text.replace("""<Route path="*" element={<Navigate to="/" replace />} />""", """<Route path="/admin" element={<ProtectedRoute><Copilot /></ProtectedRoute>} />\n          <Route path="*" element={<Navigate to="/" replace />} />""")

with open("frontend/src/App.tsx", "w", encoding="utf-8") as f:
    f.write(app_text)

print("UI Unified successfully.")
