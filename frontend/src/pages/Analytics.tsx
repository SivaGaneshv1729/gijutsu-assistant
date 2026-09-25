import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart2, FileText, Database, Users, TrendingUp, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';

const COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#f43f5e'];

const StatCard = ({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) => (
  <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex items-start gap-4 hover:border-white/10 transition-colors">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color || 'bg-indigo-500/20'}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  </div>
);

export default function Analytics() {
  const [overview, setOverview] = useState<any>(null);
  const [docStats, setDocStats] = useState<any>(null);
  const [topDocs, setTopDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock activity data (since we don't have time-series data yet)
  const activityData = [
    { day: 'Mon', queries: 12, docs: 2 },
    { day: 'Tue', queries: 28, docs: 5 },
    { day: 'Wed', queries: 19, docs: 1 },
    { day: 'Thu', queries: 34, docs: 7 },
    { day: 'Fri', queries: 45, docs: 3 },
    { day: 'Sat', queries: 22, docs: 0 },
    { day: 'Sun', queries: 17, docs: 4 },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/analytics/overview', { headers }).then(r => r.json()),
      fetch('/api/analytics/documents', { headers }).then(r => r.json()),
      fetch('/api/analytics/documents/top?limit=5', { headers }).then(r => r.json()),
    ])
      .then(([ov, ds, td]) => {
        setOverview(ov);
        setDocStats(ds);
        setTopDocs(Array.isArray(td) ? td : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <BarChart2 size={40} className="text-indigo-400 animate-pulse"/>
          <span className="text-slate-500 text-sm">Loading analytics…</span>
        </div>
      </div>
    );
  }

  const accessData = docStats?.by_access_level?.map((a: any) => ({
    name: a.access_level,
    value: a.count,
  })) || [];

  const typeData = docStats?.by_type?.map((t: any) => ({
    name: t.type,
    value: t.count,
  })) || [];

  return (
    <div className="h-full bg-[#09090b] text-slate-200 overflow-y-auto p-6 no-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <BarChart2 size={20} className="text-indigo-400"/>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-xs text-slate-500">System performance and knowledge base health</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users size={18} className="text-indigo-400"/>} label="Total Users" value={overview?.users ?? 0} color="bg-indigo-500/20"/>
        <StatCard icon={<FileText size={18} className="text-sky-400"/>} label="Documents" value={overview?.documents ?? 0} sub={`${overview?.chunks ?? 0} chunks indexed`} color="bg-sky-500/20"/>
        <StatCard icon={<Database size={18} className="text-amber-400"/>} label="Vector Chunks" value={overview?.chunks ?? 0} color="bg-amber-500/20"/>
        <StatCard icon={<TrendingUp size={18} className="text-emerald-400"/>} label="Avg Chunk/Doc" value={overview?.documents ? Math.round((overview.chunks || 0) / overview.documents) : 0} color="bg-emerald-500/20"/>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Activity */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={14} className="text-indigo-400"/> Weekly Query Activity
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}/>
              <Area type="monotone" dataKey="queries" stroke="#6366f1" fill="url(#qGrad)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Documents */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={14} className="text-sky-400"/> Top Documents by Chunks
          </h3>
          {topDocs.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topDocs.map(d => ({ name: (d.name || 'Unknown').substring(0, 14), chunks: d.chunk_count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}/>
                <Bar dataKey="chunks" fill="#0ea5e9" radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">No documents indexed yet</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Access Level Distribution */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Access Level Distribution</h3>
          {accessData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={accessData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {accessData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {accessData.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}/>
                    <span className="text-xs text-slate-400">{item.name}</span>
                    <span className="text-xs font-bold text-white ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-slate-600 text-sm">No data available</div>
          )}
        </div>

        {/* Feedback Overview (Hardcoded demo until backend tracks it) */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Response Quality Feedback</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp size={16} className="text-emerald-400"/>
                <span className="text-sm text-slate-300">Positive Feedback</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">87%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '87%' }}/>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsDown size={16} className="text-red-400"/>
                <span className="text-sm text-slate-300">Negative Feedback</span>
              </div>
              <span className="text-sm font-bold text-red-400">13%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '13%' }}/>
            </div>
            <p className="text-xs text-slate-600 pt-2">Full feedback tracking requires completing the backend persistence layer for thumbs up/down events.</p>
          </div>
        </div>
      </div>

      {/* Top docs table */}
      {topDocs.length > 0 && (
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Document Details</h3>
          <div className="space-y-2">
            {topDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.type} · {doc.access_level}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-indigo-400">{doc.chunk_count}</p>
                  <p className="text-xs text-slate-500">chunks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
