import { Activity, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '08:00', queries: 12 },
  { time: '10:00', queries: 25 },
  { time: '12:00', queries: 18 },
  { time: '14:00', queries: 45 },
  { time: '16:00', queries: 30 },
  { time: '18:00', queries: 15 },
];

export default function Dashboard() {
  const stats = [
    { label: 'Queries Today', value: '145', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Active Documents', value: '3,240', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Avg Response Time', value: '1.2s', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Active Alarms', value: '3', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-textMuted mt-1">System intelligence and metrics at a glance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl flex items-start gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-textMuted font-medium text-sm">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col">
          <h3 className="font-semibold text-lg mb-6">Intelligence Utilization</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorQueries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Recent Queries</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {[
              "E101 Spindle overload cause",
              "How to calibrate XYZ axis",
              "Maintenance schedule for model B",
              "Replace coolant filter steps",
              "Hydraulic pressure loss alarm"
            ].map((q, i) => (
              <div key={i} className="p-3 bg-surface/50 border border-white/5 rounded-xl hover:bg-surface transition-colors cursor-pointer">
                <p className="text-sm font-medium text-text">{q}</p>
                <p className="text-xs text-textMuted mt-1">2 mins ago</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
