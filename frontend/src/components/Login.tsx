import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Factory, UserPlus } from 'lucide-react';
import { login } from '../services/api';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Optional demo bypass: view the dashboard without a running backend.
    if (DEMO_MODE && mode === 'login' && username === 'demo' && password === 'demo') {
      localStorage.setItem('token', 'demo-token');
      navigate('/dashboard');
      return;
    }

    try {
      if (mode === 'login') {
        const data = await login(username, password);
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          navigate('/dashboard');
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left pane - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-indigo-900/60 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          <Factory className="h-20 w-20 text-indigo-400 mb-6" />
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            Manufacturing Engineering Intelligence
          </h1>
          <p className="text-lg text-indigo-200 max-w-lg">
            Empowering engineers and operators with instant access to technical manuals, SOPs, and AI-driven troubleshooting.
          </p>
        </div>
      </div>

      {/* Right pane - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-10 lg:hidden">
            <Factory className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">MEI Platform</h2>
          </div>

          <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white">
                {mode === 'login' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                {mode === 'login'
                  ? 'Please enter your credentials to access the platform.'
                  : 'Register an operator account to access the platform.'}
              </p>
            </div>

            <div className="flex gap-2 mb-6 bg-slate-900/60 rounded-lg p-1">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="appearance-none block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  required
                  className="appearance-none block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="appearance-none block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {mode === 'register' && (
                  <p className="mt-1 text-xs text-slate-500">New accounts are created with the OPERATOR role.</p>
                )}
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-800 transition-colors disabled:opacity-50"
              >
                {mode === 'register' ? <UserPlus className="h-4 w-4" /> : null}
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in to Dashboard' : 'Register Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}