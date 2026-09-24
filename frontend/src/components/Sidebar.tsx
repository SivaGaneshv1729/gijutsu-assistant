import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, UploadCloud, LogOut } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const token = localStorage.getItem('token');
  let role = '';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role || '';
    } catch (e) {
      console.error('Failed to parse token', e);
    }
  }

  const menu = [
    { name: 'Copilot', path: '/', icon: MessageSquare },
  ];

  if (role === 'ADMIN') {
    menu.push({ name: 'Admin Panel', path: '/admin', icon: UploadCloud });
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen glass-panel flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          MEI
        </h1>
        <p className="text-[10px] text-textMuted tracking-widest font-bold mt-1 uppercase">Engineering Intelligence</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                  : 'text-textMuted hover:bg-white/5 hover:text-text'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-textMuted hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}