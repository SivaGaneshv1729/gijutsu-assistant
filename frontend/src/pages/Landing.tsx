import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Network, Zap, Shield, Sparkles } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans w-full overflow-hidden relative selection:bg-blue-500/30">
      {/* Dynamic Animated Background Elements */}
      <div className="absolute inset-0 bg-[#0f141e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#172033] via-[#0f141e] to-[#0a0f18] -z-20"></div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_40%,transparent_100%)] -z-10 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-inner relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-xl"></div>
            <Cpu size={20} className="text-blue-400 relative z-10" />
          </div>
          <span className="font-bold text-xl tracking-wider text-white">MEI</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</button>
          <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white backdrop-blur-md transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles size={14} />
          The Future of Manufacturing
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Supercharge your <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
            Engineering Intelligence
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Unify your technical manuals, maintenance records, and operational data into a powerful, AI-driven Knowledge Graph. Resolve complex manufacturing issues in seconds, not hours.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <button 
            onClick={() => navigate('/app')}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold tracking-wide shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all duration-300 overflow-hidden flex items-center gap-2"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10">Launch Platform</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-wide backdrop-blur-md transition-all flex items-center gap-2">
            View Documentation
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 w-full text-left">
          
          {/* Feature 1 */}
          <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-colors shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Network size={24} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3">Enterprise Knowledge Graph</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dynamically maps relationships between machine parts, error codes, and historical maintenance logs for deep situational context.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-colors shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={24} className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3">Real-time Copilot</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Chat instantly with an AI assistant that understands your entire manufacturing pipeline. Includes multi-modal PDF extraction.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-colors shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield size={24} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3">Secure On-Premise Ready</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Designed with strict data isolation. Everything from vector embeddings to graph relationships stays within your perimeter.
            </p>
          </div>

        </div>

      </main>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-slate-500" />
            <span className="text-sm text-slate-500 font-medium">MEI Platform. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
