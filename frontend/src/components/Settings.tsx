import { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Bot, Database, Server, Activity, User } from 'lucide-react';
import { getCurrentUser } from '../services/api';

interface UserInfo {
  username: string;
  role: string;
}

const LLM_MODEL = import.meta.env.VITE_LLM_MODEL || 'google/flan-t5-large (free Hugging Face Inference API)';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

function StatusPill({ ok }: { ok: boolean | null }) {
  if (ok === null) return <span className="text-xs text-slate-500">—</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${
      ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
      {ok ? 'Online' : 'Offline'}
    </span>
  );
}

export default function Settings() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [aiOk, setAiOk] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const me = await getCurrentUser();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const healthRes = await fetch('/api/system/health', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const health = await healthRes.json();
      setBackendOk(Boolean(health?.database));
    } catch {
      setBackendOk(false);
    }
    try {
      const aiRes = await fetch('/api/system/ai-health', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const ai = await aiRes.json();
      setAiOk(Boolean(ai?.status === 'ok'));
    } catch {
      setAiOk(false);
    }
    setChecking(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Platform configuration and service health.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Account</h2>
          </div>
          {user ? (
            <>
              <InfoRow label="Username" value={user.username} />
              <InfoRow label="Role" value={user.role} />
            </>
          ) : (
            <p className="text-sm text-slate-500">Could not load account information.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Service Health</h2>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Server className="h-4 w-4" /> API Gateway (Spring Boot · :8080)
            </div>
            <StatusPill ok={backendOk} />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Bot className="h-4 w-4" /> AI Engine (FastAPI · :8000)
            </div>
            <StatusPill ok={aiOk} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Database className="h-4 w-4" /> PostgreSQL + pgvector (:5433)
            </div>
            <StatusPill ok={backendOk} />
          </div>
          <button
            onClick={checkHealth}
            disabled={checking}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {checking ? 'Checking…' : 'Check health now'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Intelligence Engine</h2>
          </div>
          <InfoRow label="Embedding model" value="all-MiniLM-L6-v2 (384-dim)" />
          <InfoRow label="LLM" value={LLM_MODEL} />
          <InfoRow label="Retrieval" value="Hybrid RAG · pgvector similarity search" />
          <InfoRow label="Access control" value="Role-based filtering (RBAC)" />
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-300 leading-relaxed">
            All API traffic is authenticated with JWT. Queries are filtered by role at the vector
            retrieval layer, so operators only see content their role permits.
          </p>
        </div>
      </div>
    </div>
  );
}