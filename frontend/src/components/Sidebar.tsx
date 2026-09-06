import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Bot, Database, Settings, Factory, MessageSquare } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'AI Assistant', icon: Bot, end: true },
  { to: '/dashboard/knowledge', label: 'Knowledge Base', icon: Database, end: false },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, end: false },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center gap-3 bg-slate-950/50">
        <Factory className="h-8 w-8 text-indigo-500" />
        <span className="font-bold text-white tracking-wide">MEI Platform</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg font-medium transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
      <NavLink to="/dashboard" className="flex items-center gap-2">
        <Factory className="h-6 w-6 text-indigo-400" />
        <span className="font-bold">MEI</span>
      </NavLink>
      <div className="flex items-center gap-2">
        <NavLink to="/dashboard/knowledge" className="p-2" title="Knowledge Base">
          <Database className="h-5 w-5" />
        </NavLink>
        <NavLink to="/dashboard/settings" className="p-2" title="Settings">
          <Settings className="h-5 w-5" />
        </NavLink>
        <button onClick={handleLogout} className="p-2" title="Sign out">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export function MobileAssistantHint() {
  return (
    <NavLink
      to="/dashboard"
      className="md:hidden fixed bottom-20 right-4 z-20 p-3 rounded-full bg-indigo-600 text-white shadow-lg"
      title="Open AI Assistant"
    >
      <MessageSquare className="h-5 w-5" />
    </NavLink>
  );
}