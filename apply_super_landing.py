# -*- coding: utf-8 -*-
landing_content = """import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Network, Zap, Shield, Sparkles, BarChart3, Database, Workflow, Terminal, Users, Search, CheckCircle2, Bot, Code2, LineChart, FileText, ChevronRight, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('graph');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans w-full overflow-hidden relative selection:bg-blue-500/30">
      
      {/* Dynamic Animated Background Elements */}
      <div className="fixed inset-0 bg-[#030712] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f172a] via-[#030712] to-[#000000] -z-20"></div>
      
      <div className="fixed top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="fixed top-[20%] right-[-10%] w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '15s' }}></div>
      <div className="fixed bottom-[-20%] left-[20%] w-[900px] h-[900px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '18s' }}></div>

      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay -z-10"></div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_30%,transparent_100%)] -z-10 pointer-events-none"></div>

      {/* Floating Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#030712]/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.2)] relative overflow-hidden group-hover:border-blue-500/50 transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]">
              <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-2xl"></div>
              <Cpu size={20} className="text-blue-400 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-white">MEI<span className="text-blue-500">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#security" className="hover:text-white transition-colors">Enterprise</a>
            <a href="#docs" className="hover:text-white transition-colors">Developers</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Log in</button>
            <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-slate-200 text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all transform hover:scale-105">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 lg:pt-48 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <Sparkles size={14} className="text-blue-400" />
          Introducing MEI v2.0
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 leading-[1.05]">
          The intelligence layer <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            for modern manufacturing.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Unify your technical manuals, maintenance records, and live telemetry data into a self-updating, interactive AI Knowledge Graph. Ask complex questions, instantly resolve downtime.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <button 
            onClick={() => navigate('/app')}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold tracking-wide shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all duration-300 overflow-hidden flex items-center gap-3 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10">Deploy to Production</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="px-8 py-4 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-bold tracking-wide backdrop-blur-md transition-all flex items-center gap-2 transform hover:-translate-y-1">
            <Code2 size={18} className="text-slate-400" />
            View API Documentation
          </button>
        </div>

        {/* Hyper-Realistic Application Mockup */}
        <div className="mt-32 w-full relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 perspective-[2000px]">
          {/* Huge Glowing Backing */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-purple-600/10 blur-[100px] -z-10 rounded-full opacity-60 transform scale-110"></div>
          
          <div className="relative rounded-3xl border border-white/10 bg-[#09090b]/90 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden transform rotate-x-12 scale-100 hover:rotate-x-0 hover:scale-[1.02] transition-all duration-[800ms] ease-out ring-1 ring-white/5">
            
            {/* Window Header */}
            <div className="h-14 border-b border-white/5 bg-[#030712]/50 flex items-center justify-between px-6 backdrop-blur-sm">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
              </div>
              <div className="px-32 h-7 rounded-lg bg-[#111827] border border-white/5 flex items-center justify-center shadow-inner">
                <Search size={12} className="text-slate-500 mr-2" />
                <span className="text-[11px] text-slate-400 font-mono tracking-widest">mei.enterprise.local</span>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/5"></div>
              </div>
            </div>

            {/* Application Body */}
            <div className="flex h-[500px] md:h-[700px]">
              
              {/* Sidebar Mock */}
              <div className="w-[240px] border-r border-white/5 bg-[#030712]/30 flex-col hidden lg:flex p-4 gap-2">
                <div className="flex items-center gap-3 px-3 py-2 text-white bg-blue-600/10 border border-blue-500/20 rounded-xl mb-4">
                  <Database size={16} className="text-blue-400" />
                  <span className="text-sm font-semibold tracking-wide">Knowledge Graph</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-xl transition-colors">
                  <Bot size={16} />
                  <span className="text-sm font-medium tracking-wide">Copilot Agent</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-xl transition-colors">
                  <LineChart size={16} />
                  <span className="text-sm font-medium tracking-wide">Telemetry Analytics</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-xl transition-colors">
                  <FileText size={16} />
                  <span className="text-sm font-medium tracking-wide">Document Ingestion</span>
                </div>
                <div className="mt-auto px-4 py-3 bg-slate-900/50 rounded-xl border border-white/5">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-slate-400">Node Sync</span>
                     <span className="text-xs text-green-400">100%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                   </div>
                </div>
              </div>

              {/* Main Content Area Mock */}
              <div className="flex-1 flex flex-col bg-[#050505]">
                {/* Internal Header */}
                <div className="h-16 border-b border-white/5 flex items-center px-8 gap-6">
                  <button onClick={() => setActiveTab('graph')} className={`text-sm font-semibold transition-colors pb-5 pt-5 border-b-2 ${activeTab === 'graph' ? 'text-blue-400 border-blue-500' : 'text-slate-500 border-transparent'}`}>Entity Visualization</button>
                  <button onClick={() => setActiveTab('terminal')} className={`text-sm font-semibold transition-colors pb-5 pt-5 border-b-2 ${activeTab === 'terminal' ? 'text-blue-400 border-blue-500' : 'text-slate-500 border-transparent'}`}>Agent Logs</button>
                </div>
                
                {/* Viewport */}
                <div className="flex-1 p-6 relative overflow-hidden flex items-center justify-center">
                  
                  {activeTab === 'graph' && (
                    <div className="w-full h-full relative rounded-2xl border border-white/5 bg-[#030712] overflow-hidden flex items-center justify-center shadow-inner">
                      {/* Grid background for graph */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                      
                      {/* Node Connections */}
                      <svg className="absolute inset-0 w-full h-full">
                        <line x1="30%" y1="30%" x2="50%" y2="50%" stroke="rgba(59,130,246,0.3)" strokeWidth="2" className="animate-pulse" />
                        <line x1="50%" y1="50%" x2="70%" y2="40%" stroke="rgba(168,85,247,0.3)" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="60%" y2="70%" stroke="rgba(6,182,212,0.3)" strokeWidth="2" />
                        <line x1="30%" y1="30%" x2="20%" y2="60%" stroke="rgba(236,72,153,0.3)" strokeWidth="2" />
                      </svg>

                      {/* Nodes */}
                      <div className="absolute top-[30%] left-[30%] w-16 h-16 rounded-full bg-[#1e293b] border-2 border-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
                        <Network size={24} className="text-blue-400" />
                      </div>
                      <div className="absolute top-[50%] left-[50%] w-20 h-20 rounded-full bg-[#1e293b] border-2 border-purple-500 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.5)] transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:scale-110 transition-transform">
                        <Cpu size={32} className="text-purple-400" />
                      </div>
                      <div className="absolute top-[40%] left-[70%] w-14 h-14 rounded-full bg-[#1e293b] border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
                        <Database size={20} className="text-cyan-400" />
                      </div>
                      <div className="absolute top-[70%] left-[60%] w-14 h-14 rounded-full bg-[#1e293b] border-2 border-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
                        <Activity size={20} className="text-pink-400" />
                      </div>
                      <div className="absolute top-[60%] left-[20%] w-12 h-12 rounded-full bg-[#1e293b] border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
                        <FileText size={16} className="text-emerald-400" />
                      </div>

                      {/* Mock Info Card */}
                      <div className="absolute bottom-6 right-6 w-64 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Cpu size={16} className="text-purple-400" />
                          <h4 className="font-bold text-white text-sm">Pump_Assembly_A1</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Status</span>
                            <span className="text-green-400 font-medium">Operational</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Last Maintenance</span>
                            <span className="text-slate-300">2 days ago</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Linked Manuals</span>
                            <span className="text-blue-400">4 Docs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'terminal' && (
                    <div className="w-full h-full rounded-2xl border border-white/5 bg-[#050505] p-6 font-mono text-sm shadow-inner relative overflow-hidden">
                      <div className="text-slate-500 mb-2">mei-ai-agent ~ querying knowledge graph...</div>
                      <div className="text-blue-400 mb-1">$ MATCH (p:Part {name: 'Pump_Assembly_A1'})-[:HAS_MANUAL]->(m:Manual)</div>
                      <div className="text-blue-400 mb-4">$ RETURN p, m LIMIT 5</div>
                      <div className="text-green-400 mb-1">&gt; 4 nodes found. Extracting embeddings...</div>
                      <div className="text-slate-400 mb-1 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Cross-referencing telemetry data...
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent"></div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
        
      </main>

      {/* Metrics Section */}
      <section className="border-y border-white/5 bg-[#050505] relative z-10">
        <div className="absolute inset-0 bg-blue-900/5"></div>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5 relative z-10">
            <div className="text-center px-4">
              <h4 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">99.9%</h4>
              <p className="text-sm text-slate-500 font-semibold tracking-wide uppercase">Uptime Guarantee</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">10x</h4>
              <p className="text-sm text-slate-500 font-semibold tracking-wide uppercase">Issue Resolution Speed</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">5M+</h4>
              <p className="text-sm text-slate-500 font-semibold tracking-wide uppercase">Nodes Indexed</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">AES-256</h4>
              <p className="text-sm text-slate-500 font-semibold tracking-wide uppercase">Enterprise Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-40 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">A unified operating system <br/> for manufacturing.</h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">Stop digging through fragmented PDFs and legacy databases. MEI ingests everything, builds a unified graph, and lets you talk directly to your factory.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[650px]">
            
            {/* Bento 1: Copilot */}
            <div className="md:col-span-2 md:row-span-1 bg-[#0a0a0a] border border-white/5 rounded-3xl p-10 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
              <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent blur-3xl -z-10 group-hover:from-blue-600/20 transition-colors"></div>
              <Bot size={36} className="text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-bold text-white mb-4">Interactive AI Copilot</h3>
              <p className="text-slate-400 max-w-lg text-lg leading-relaxed">Query complex maintenance manuals and operational guidelines using natural language. The copilot cross-references PDFs, charts, and live data instantly, providing cited answers.</p>
            </div>

            {/* Bento 2: Graph */}
            <div className="md:col-span-1 md:row-span-2 bg-[#0a0a0a] border border-white/5 rounded-3xl p-10 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500 flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 to-transparent blur-3xl -z-10 group-hover:from-purple-600/10 transition-colors"></div>
              <Database size={36} className="text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-bold text-white mb-4">Neo4j Graph</h3>
              <p className="text-slate-400 mb-8 flex-1 text-lg leading-relaxed">Visualize the hidden dependencies between machine components, error codes, and factory lines.</p>
              <div className="w-full h-56 border border-white/5 rounded-2xl bg-[#050505] flex items-center justify-center relative overflow-hidden group-hover:border-purple-500/20 transition-colors">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 to-transparent"></div>
                 <Network size={80} className="text-purple-500/30 group-hover:text-purple-500/60 transition-colors duration-500" />
              </div>
            </div>

            {/* Bento 3: Analytics */}
            <div className="md:col-span-1 md:row-span-1 bg-[#0a0a0a] border border-white/5 rounded-3xl p-10 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500">
              <BarChart3 size={36} className="text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-4">Predictive Analytics</h3>
              <p className="text-slate-400 text-lg leading-relaxed">Identify failure patterns before they disrupt production using advanced machine learning models.</p>
            </div>

            {/* Bento 4: Security */}
            <div className="md:col-span-1 md:row-span-1 bg-[#0a0a0a] border border-white/5 rounded-3xl p-10 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
              <Shield size={36} className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-4">Enterprise Grade</h3>
              <p className="text-slate-400 text-lg leading-relaxed">On-premise deployable, role-based access, and strict data isolation guarantees for sensitive IP.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 blur-[150px] -z-10 rounded-full transform scale-150"></div>
        <div className="max-w-5xl mx-auto px-6 text-center bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/10 p-20 rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.1)]">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-8 tracking-tighter">Ready to modernize your operations?</h2>
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto">Join forward-thinking manufacturing teams using MEI to reduce downtime and accelerate decision making.</p>
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-12 py-6 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-xl tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-4"
          >
            Start Building Intelligence
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#030712] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                   <Cpu size={16} className="text-blue-400" />
                 </div>
                 <span className="font-extrabold text-xl tracking-tighter text-white">MEI<span className="text-blue-500">.</span></span>
               </div>
               <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
                 The definitive intelligence layer for modern manufacturing. Transforming raw operational data into actionable, graphed insights.
               </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Knowledge Graph</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">AI Copilot</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Company</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-600 text-sm">
              © 2026 MEI Inc. All rights reserved.
            </div>
            <div className="flex gap-8 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
"""

with open("frontend/src/pages/Landing.tsx", "w", encoding="utf-8") as f:
    f.write(landing_content)

print("Super Advanced Landing Page written successfully!")
