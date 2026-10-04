import os

file_path = r'frontend/src/pages/Analytics.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = '''import { useEffect, useState } from 'react';'''
replace1 = '''import { useEffect, useState } from 'react';\nimport { ModelViewer } from '../components/ModelViewer';'''

target2 = '''          <div className="grid grid-cols-2 gap-6">
             <div className="bg-gradient-to-tr from-[#0a0a0a] to-[#111827] border border-white/5 rounded-2xl p-6">
                <ShieldCheck size={20} className="text-emerald-400 mb-3" />
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Security Events</h4>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-xs text-emerald-500 mt-1">No anomalies detected</div>
             </div>
             <div className="bg-gradient-to-tr from-[#0a0a0a] to-[#111827] border border-white/5 rounded-2xl p-6">
                <Zap size={20} className="text-yellow-400 mb-3" />
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Queries</h4>
                <div className="text-2xl font-bold text-white">1,432</div>
                <div className="text-xs text-blue-400 mt-1">~42 QPS avg</div>
             </div>
          </div>'''

replace2 = '''          <div className="grid grid-cols-2 gap-6">
             <div className="bg-gradient-to-tr from-[#0a0a0a] to-[#111827] border border-white/5 rounded-2xl p-6">
                <ShieldCheck size={20} className="text-emerald-400 mb-3" />
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Security Events</h4>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-xs text-emerald-500 mt-1">No anomalies detected</div>
             </div>
             <div className="bg-gradient-to-tr from-[#0a0a0a] to-[#111827] border border-white/5 rounded-2xl p-6">
                <Zap size={20} className="text-yellow-400 mb-3" />
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Queries</h4>
                <div className="text-2xl font-bold text-white">1,432</div>
                <div className="text-xs text-blue-400 mt-1">~42 QPS avg</div>
             </div>
          </div>
          
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-sm font-bold text-white mb-4">Live 3D Hardware Telemetry</h3>
            <div className="w-full h-[300px] rounded-xl overflow-hidden border border-white/5 bg-[#050505] relative">
               <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Motor A1 Sync</span>
               </div>
               <ModelViewer type="motor" />
            </div>
          </div>'''

content = content.replace(target1, replace1)
content = content.replace(target2, replace2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Analytics.tsx updated successfully.')
