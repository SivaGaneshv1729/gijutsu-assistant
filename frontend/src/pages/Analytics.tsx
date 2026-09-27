import { useEffect, useState } from 'react';
import { ModelViewer } from '../components/ModelViewer';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, Cpu, Zap, Server, ShieldCheck, Database, Radio, TrendingUp } from 'lucide-react';

const NodeStatus = ({ name, load, health }: { name: string, load: number, health: 'good' | 'warn' | 'critical' }) => {
  const color = health === 'good' ? 'bg-emerald-500' : health === 'warn' ? 'bg-orange-500' : 'bg-red-500';
  const glow = health === 'good' ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' : health === 'warn' ? 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'shadow-[0_0_15px_rgba(239,68,68,0.3)]';
  
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Server size={14} className="text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-xs font-bold text-slate-300">{name}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${color} ${glow} animate-pulse`}></div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Load</span>
          <div className="text-lg font-bold text-white">{load}%</div>
        </div>
        <div className="w-16 h-8 flex items-end gap-0.5">
           {[...Array(8)].map((_, i) => (
             <div key={i} className={`flex-1 ${color} rounded-t-sm opacity-50`} style={{ height: `${Math.random() * 100}%` }}></div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);

  // Mock Performance Data
  const performanceData = Array.from({length: 24}, (_, i) => ({
    time: `${i}:00`,
    throughput: Math.floor(Math.random() * 50) + 50,
    latency: Math.floor(Math.random() * 20) + 10,
  }));

  useEffect(() => {
    // Simulate loading for the premium effect
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#030712] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="w-64 h-64 border-[0.5px] border-blue-500/20 rounded-full flex items-center justify-center relative">
          <div className="absolute w-full h-full border-t border-blue-500 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute w-48 h-48 border-b border-purple-500 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
          <Activity size={32} className="text-blue-500 animate-pulse" />
        </div>
        <div className="mt-8 text-xs text-blue-400 font-mono tracking-widest uppercase animate-pulse">Initializing Command Center...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#030712] p-6 lg:p-8 overflow-y-auto no-scrollbar relative font-sans text-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#000000] -z-10 pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Radio className="text-blue-500" />
            Global Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time infrastructure monitoring and AI performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg flex items-center gap-3 shadow-inner">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
             <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">All Systems Operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Nodes */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Main KPI */}
          <div className="bg-gradient-to-br from-blue-900/40 to-[#0a0a0a] border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition-colors"></div>
            <Cpu size={24} className="text-blue-400 mb-4" />
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">AI Inference Speed</h4>
            <div className="text-4xl font-extrabold text-white">24<span className="text-lg text-slate-500 ml-1">ms</span></div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <TrendingUp size={14} />
              <span>12% faster than yesterday</span>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Database size={16} className="text-purple-400" />
              Infrastructure Nodes
            </h3>
            <div className="flex flex-col gap-3">
              <NodeStatus name="Graph DB (Neo4j)" load={42} health="good" />
              <NodeStatus name="Vector Search (OpenSearch)" load={85} health="warn" />
              <NodeStatus name="PostgreSQL Main" load={28} health="good" />
            </div>
          </div>
        </div>

        {/* Center Column: Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex-1 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 p-6 flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Throughput</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Latency</span>
               </div>
            </div>
            
            <h3 className="text-sm font-bold text-white mb-8">Platform Traffic (24h)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorThroughput)" />
                  <Area type="monotone" dataKey="latency" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
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
          </div>
        </div>



      </div>
    </div>
  );
}
