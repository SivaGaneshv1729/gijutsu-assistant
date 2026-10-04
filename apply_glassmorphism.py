import os

file_path = r'frontend/src/pages/Copilot.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = '''  return (
    <div className={lex h-screen bg-[#09090b] text-slate-200 font-sans w-full overflow-hidden }>
      
      {/* LEFT SIDEBAR */}
      <div 
        style={{ width: sidebarOpen ? sidebarWidth : 0, transition: isResizingSidebar ? 'none' : 'width 0.3s ease-in-out' }}
        className={elative shrink-0 flex flex-col bg-[#09090b] border-r border-white/5 h-full overflow-hidden z-30}
      >'''

replace1 = '''  return (
    <div className={lex h-screen bg-[#030712] text-slate-200 font-sans w-full overflow-hidden relative selection:bg-blue-500/30 }>
      {/* Dynamic Glassmorphic Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none z-0"></div>
      
      {/* LEFT SIDEBAR (GLASSMORPHIC) */}
      <div 
        style={{ width: sidebarOpen ? sidebarWidth : 0, transition: isResizingSidebar ? 'none' : 'width 0.3s ease-in-out' }}
        className={elative shrink-0 flex flex-col bg-[#050505]/60 backdrop-blur-3xl border-r border-white/10 shadow-[4px_0_40px_rgba(0,0,0,0.5)] h-full overflow-hidden z-30}
      >'''

# Also update the main chat area background to be fully transparent so the ambient glows show through!
target2 = '''      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#09090b] relative z-10">'''

replace2 = '''      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">'''

# And the input bar at the bottom:
target3 = '''          {/* Input Area */}
          <div className="shrink-0 p-4 border-t border-white/5 bg-[#09090b]">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-20 group-focus-within:opacity-50 blur transition duration-500"></div>'''

replace3 = '''          {/* Input Area */}
          <div className="shrink-0 p-4 border-t border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl opacity-30 group-focus-within:opacity-70 blur-md transition duration-500"></div>'''

content = content.replace(target1, replace1)
content = content.replace(target2, replace2)
content = content.replace(target3, replace3)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Copilot.tsx glassmorphism applied successfully.')
