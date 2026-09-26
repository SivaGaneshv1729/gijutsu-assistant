import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Mail, ArrowRight, Loader2, Sparkles, Cpu, Fingerprint } from 'lucide-react';
import { login, register } from '../services/api';

type AuthMode = 'login' | 'register';

export default function Login() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const { token } = await register(username, email, password);
        localStorage.setItem('token', token);
        navigate('/app');
        return;
      }

      const { token } = await login(username, password);
      localStorage.setItem('token', token);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-slate-200 font-sans w-full overflow-hidden relative selection:bg-blue-500/30">
      {/* Dynamic Animated Background Elements */}
      <div className="absolute inset-0 bg-[#0f141e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#172033] via-[#0f141e] to-[#0a0f18] -z-20"></div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] -z-10 pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-[420px] relative z-10 px-4 sm:px-0">
        
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl -z-10 scale-95 opacity-50"></div>
        
        <div className="bg-[#1e293b]/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 sm:p-10 relative overflow-hidden transition-all duration-500">
          
          {/* Card inner top highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {/* Header */}
          <div className="text-center mb-10 mt-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-6 shadow-inner relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl"></div>
              <Cpu size={28} className="text-blue-400 relative z-10" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent tracking-tight">
              MEI Platform
            </h1>
            <p className="text-xs text-slate-400 mt-3 tracking-[0.2em] font-semibold uppercase flex items-center justify-center gap-2">
              <Sparkles size={12} className="text-yellow-500/70" />
              Engineering Intelligence
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-[#0f141e]/80 rounded-xl p-1 mb-8 border border-white/5 relative shadow-inner">
            <div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#2e3b4e]/80 rounded-lg shadow-sm border border-white/10 transition-transform duration-300 ease-out"
              style={{ transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)' }}
            />
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors relative z-10 ${
                mode === 'login' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors relative z-10 ${
                mode === 'register' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="w-1 h-1 rounded-full bg-red-400 animate-ping"></div>
                {error}
              </div>
            )}

            <div className="space-y-1.5 group">
              <label className="text-xs font-bold tracking-wider text-slate-500 uppercase ml-1 transition-colors group-focus-within:text-blue-400">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-[#0f141e]/60 border border-white/5 rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#1e293b]/60 text-slate-200 placeholder-slate-600 outline-none transition-all text-[15px] shadow-inner"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5 group animate-in slide-in-from-top-4 fade-in duration-300">
                <label className="text-xs font-bold tracking-wider text-slate-500 uppercase ml-1 transition-colors group-focus-within:text-blue-400">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 bg-[#0f141e]/60 border border-white/5 rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#1e293b]/60 text-slate-200 placeholder-slate-600 outline-none transition-all text-[15px] shadow-inner"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 group">
              <label className="text-xs font-bold tracking-wider text-slate-500 uppercase ml-1 transition-colors group-focus-within:text-blue-400 flex justify-between">
                <span>Password</span>
                {mode === 'login' && <span className="text-slate-600 hover:text-blue-400 cursor-pointer transition-colors normal-case tracking-normal">Forgot?</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-[#0f141e]/60 border border-white/5 rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#1e293b]/60 text-slate-200 placeholder-slate-600 outline-none transition-all text-[15px] shadow-inner font-mono"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 mt-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <div className="flex items-center justify-center gap-2 relative z-10">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white/80" />
                    <span>{mode === 'login' ? 'Authenticating...' : 'Registering...'}</span>
                  </>
                ) : (
                  <>
                    <Fingerprint size={18} className="text-white/80 group-hover:scale-110 transition-transform" />
                    <span>{mode === 'login' ? 'Secure Login' : 'Create Account'}</span>
                    <ArrowRight size={16} className="text-white/70 group-hover:translate-x-1 transition-transform ml-1" />
                  </>
                )}
              </div>
            </button>
          </form>

        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-xs text-slate-500 font-medium">
          Protected by Enterprise-Grade Security
        </div>
      </div>
    </div>
  );
}
