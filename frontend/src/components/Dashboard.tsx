import { Outlet } from 'react-router-dom';
import Sidebar, { MobileHeader } from './Sidebar';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full min-w-0">
        <MobileHeader />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}