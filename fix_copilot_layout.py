with open("frontend/src/pages/Copilot.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Make sure imports are there
if "import KnowledgeGraph" not in text:
    text = text.replace("import ReactMarkdown from 'react-markdown';", "import ReactMarkdown from 'react-markdown';\nimport KnowledgeGraph from './KnowledgeGraph';\nimport Analytics from './Analytics';\nimport AdminPanel from './AdminPanel';")

text = text.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useLocation } from 'react-router-dom';")

if "const currentView =" not in text:
    text = text.replace("const { language, setLanguage, t } = useLanguage();", """const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const currentView = location.pathname.includes('/graph') ? 'graph' :
                      location.pathname.includes('/analytics') ? 'analytics' :
                      location.pathname.includes('/admin') ? 'admin' : 'chat';""")

# Update Sidebar items
text = text.replace("""<SidebarItem icon={<GitBranch size={16}/>} label="Knowledge Graph" onClick={() => navigate('/graph')} />""", """<SidebarItem icon={<GitBranch size={16}/>} label="Knowledge Graph" onClick={() => navigate('/graph')} active={currentView === 'graph'} />""")
text = text.replace("""<SidebarItem icon={<BarChart2 size={16}/>} label="Analytics" onClick={() => navigate('/analytics')} />""", """<SidebarItem icon={<BarChart2 size={16}/>} label="Analytics" onClick={() => navigate('/analytics')} active={currentView === 'analytics'} />""")
text = text.replace("""<SidebarItem icon={<Settings size={16}/>} label={t("sidebar.settings")} onClick={() => setSettingsOpen(true)} />""", """<SidebarItem icon={<UploadCloud size={16}/>} label="Admin Panel" onClick={() => navigate('/admin')} active={currentView === 'admin'} />\n               <SidebarItem icon={<Settings size={16}/>} label={t("sidebar.settings")} onClick={() => setSettingsOpen(true)} />""")

if "UploadCloud" not in text.split("from 'lucide-react'")[0]:
    text = text.replace("Settings, Check", "Settings, Check, UploadCloud")

text = text.replace("""function SidebarItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {""", """function SidebarItem({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }) {""")
text = text.replace("""className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
    >""", """className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >""")


# Find MAIN CHAT AREA
start_idx = text.find("{/* MAIN CHAT AREA */}")
end_idx = text.find("{/* RIGHT SIDEBAR (PDF PANEL) */}")

if start_idx != -1 and end_idx != -1:
    chat_block = text[start_idx:end_idx]
    
    # Check if already wrapped
    if "{currentView === 'chat' && (" not in chat_block:
        new_block = f"""{{currentView === 'chat' && (
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
        <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar relative">
          <Analytics />
        </div>
      )}}

      {{currentView === 'admin' && (
        <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar relative">
          <AdminPanel />
        </div>
      )}}

      """
        text = text[:start_idx] + new_block + text[end_idx:]

# Right sidebar should only render on chat view
text = text.replace("{/* RIGHT SIDEBAR (PDF PANEL) */}", """{/* RIGHT SIDEBAR (PDF PANEL) */}
      {currentView === 'chat' && (""")
text = text.replace("{/* Settings Modal */}", """)}
      {/* Settings Modal */}""")

with open("frontend/src/pages/Copilot.tsx", "w", encoding="utf-8") as f:
    f.write(text)

with open("frontend/src/App.tsx", "r", encoding="utf-8") as f:
    app_text = f.read()

app_text = app_text.replace("<KnowledgeGraph />", "<Copilot />")
app_text = app_text.replace("<Analytics />", "<Copilot />")
if "<AdminPanel />" in app_text:
    app_text = app_text.replace("<AdminPanel />", "<Copilot />")
else:
    app_text = app_text.replace("""<Route path="*" element={<Navigate to="/" replace />} />""", """<Route path="/admin" element={<ProtectedRoute><Copilot /></ProtectedRoute>} />\n          <Route path="*" element={<Navigate to="/" replace />} />""")

app_text = app_text.replace("import KnowledgeGraph from './pages/KnowledgeGraph';\n", "")
app_text = app_text.replace("import Analytics from './pages/Analytics';\n", "")
app_text = app_text.replace("import AdminPanel from './pages/AdminPanel';\n", "")

with open("frontend/src/App.tsx", "w", encoding="utf-8") as f:
    f.write(app_text)

print("Copilot.tsx and App.tsx fixed properly!")
