# -*- coding: utf-8 -*-
landing_content = """import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Network, Zap, Shield, Sparkles, BarChart3, Database, Workflow, Terminal, Users, Search, CheckCircle2, Bot } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans w-full overflow-hidden relative selection:bg-blue-500/30">
      
      {/* Dynamic Animated Background Elements */}
      <div className="fixed inset-0 bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111827] via-[#050505] to-[#000000] -z-20"></div>
      
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="fixed top-[30%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '15s' }}></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '18s' }}></div>

      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay -z-10"></div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_40%,transparent_100%)] -z-10 pointer-events-none"></div>

      {/* Floating Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:border-blue-500/50 transition-colors">
              <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-xl"></div>
              <Cpu size={20} className="text-blue-400 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-white">MEI<span className="text-blue-500">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Sign In</button>
            <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-slate-200 text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all transform hover:scale-105">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 lg:pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md">
          <Sparkles size={14} className="text-blue-400" />
          The Intelligent Manufacturing Copilot
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 leading-[1.1]">
          Decentralized data. <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Centralized Intelligence.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Transform scattered operational manuals, maintenance logs, and live machine data into a single, interactive AI Knowledge Graph. Ask complex questions, get instantaneous insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <button 
            onClick={() => navigate('/app')}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold tracking-wide shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all duration-300 overflow-hidden flex items-center gap-3 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10">Access the Platform</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="px-8 py-4 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-bold tracking-wide backdrop-blur-md transition-all flex items-center gap-2 transform hover:-translate-y-1">
            <Terminal size={18} className="text-slate-400" />
            Read the Docs
          </button>
        </div>

        {/* Application Mockup Showcase */}
        <div className="mt-24 w-full relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl -z-10 rounded-full opacity-50 transform scale-150"></div>
          
          <div className="relative rounded-3xl border border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl overflow-hidden transform rotate-x-12 scale-100 hover:rotate-x-0 hover:scale-105 transition-all duration-700 ease-out">
            {/* Mockup Header */}
            <div className="h-12 border-b border-slate-800 bg-slate-900/50 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="mx-auto px-32 h-6 rounded-md bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                <span className="text-[10px] text-slate-500 font-mono tracking-widest">mei-platform-dashboard</span>
              </div>
            </div>
            {/* Mockup Body - Simulated App */}
            <div className="h-[400px] md:h-[600px] flex">
              {/* Mock Sidebar */}
              <div className="w-16 md:w-64 border-r border-slate-800 bg-slate-900/30 p-4 hidden sm:flex flex-col gap-4">
                <div className="h-8 rounded bg-slate-800/50 w-full mb-4"></div>
                <div className="h-4 rounded bg-slate-800/50 w-3/4"></div>
                <div className="h-4 rounded bg-slate-800/50 w-1/2"></div>
                <div className="h-4 rounded bg-slate-800/50 w-5/6"></div>
              </div>
              {/* Mock Main Area */}
              <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="h-8 rounded bg-slate-800/50 w-1/4"></div>
                  <div className="h-8 rounded-full bg-blue-600/20 border border-blue-500/30 w-32"></div>
                </div>
                {/* Mock Graph */}
                <div className="flex-1 border border-slate-800 rounded-2xl bg-slate-900/20 relative flex items-center justify-center overflow-hidden">
                  <Network size={120} className="text-slate-800 absolute opacity-30" />
                  <div className="absolute w-[2px] h-[100px] bg-blue-500/50 top-1/2 left-1/4 rotate-45 transform -translate-y-1/2"></div>
                  <div className="absolute w-[2px] h-[150px] bg-purple-500/50 top-1/4 right-1/3 -rotate-12 transform -translate-y-1/2"></div>
                  <div className="absolute w-[2px] h-[80px] bg-cyan-500/50 bottom-1/4 left-1/3 rotate-90 transform -translate-y-1/2"></div>
                  
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400 absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400 absolute top-1/4 right-1/3 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(168,85,247,0.5)]"></div>
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 absolute bottom-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </main>

      {/* Metrics Section */}
      <section className="border-y border-white/5 bg-slate-900/20 backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            <div className="text-center px-4">
              <h4 className="text-4xl font-extrabold text-white mb-2">99.9%</h4>
              <p className="text-sm text-slate-500 font-medium">Uptime Guarantee</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl font-extrabold text-white mb-2">10x</h4>
              <p className="text-sm text-slate-500 font-medium">Faster Issue Resolution</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl font-extrabold text-white mb-2">500k+</h4>
              <p className="text-sm text-slate-500 font-medium">Documents Analyzed</p>
            </div>
            <div className="text-center px-4">
              <h4 className="text-4xl font-extrabold text-white mb-2">AES-256</h4>
              <p className="text-sm text-slate-500 font-medium">End-to-End Encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">A unified operating system <br/> for manufacturing.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to digitize, analyze, and optimize your production lines. Powered by deep learning and graph databases.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
            
            {/* Bento 1: Copilot */}
            <div className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute right-0 top-0 w-1/2 h-full bg-blue-500/5 blur-[100px] -z-10 group-hover:bg-blue-500/10 transition-colors"></div>
              <Bot size={32} className="text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Interactive AI Copilot</h3>
              <p className="text-slate-400 max-w-md">Query complex maintenance manuals and operational guidelines using natural language. The copilot cross-references PDFs and live data instantly.</p>
            </div>

            {/* Bento 2: Graph */}
            <div className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-slate-900 to-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors flex flex-col">
              <div className="absolute inset-0 bg-purple-500/5 blur-[80px] -z-10 group-hover:bg-purple-500/10 transition-colors"></div>
              <Database size={32} className="text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Neo4j Knowledge Graph</h3>
              <p className="text-slate-400 mb-8 flex-1">Visualize the hidden dependencies between machine components, error codes, and factory lines.</p>
              <div className="w-full h-48 border border-slate-800 rounded-xl bg-slate-950 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 to-transparent"></div>
                 <Network size={64} className="text-purple-500/50" />
              </div>
            </div>

            {/* Bento 3: Analytics */}
            <div className="md:col-span-1 md:row-span-1 bg-gradient-to-tr from-slate-900 to-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <BarChart3 size={32} className="text-cyan-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Predictive Analytics</h3>
              <p className="text-slate-400">Identify failure patterns before they disrupt production.</p>
            </div>

            {/* Bento 4: Security */}
            <div className="md:col-span-1 md:row-span-1 bg-gradient-to-tl from-slate-900 to-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <Shield size={32} className="text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Enterprise Grade</h3>
              <p className="text-slate-400">On-premise deployable, role-based access, and strict data isolation guarantees.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="absolute inset-0 bg-blue-500/5 blur-[120px] -z-10 rounded-full"></div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to modernize your operations?</h2>
          <p className="text-xl text-slate-400 mb-10">Join forward-thinking manufacturing teams using MEI to reduce downtime and accelerate decision making.</p>
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-10 py-5 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-lg tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
          >
            Start Building Intelligence
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Cpu size={20} className="text-slate-600" />
            <span className="text-sm text-slate-500 font-semibold tracking-wider uppercase">Manufacturing Engineering Intelligence</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Platform</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
          <div className="text-slate-600 text-sm">
            © 2026 MEI Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
"""

with open("frontend/src/pages/Landing.tsx", "w", encoding="utf-8") as f:
    f.write(landing_content)

print("Advanced Landing Page written successfully!")
