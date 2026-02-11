import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Folder, UserCircle, Users as UsersIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const IRONTEC_GREEN = '#e5ff48';

const baseItems = [
  { key: 'dashboard', label: 'dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { key: 'projects', label: 'projects', icon: Folder, to: '/projects' },
  { key: 'mywork', label: 'my work', icon: UserCircle, to: '/mywork' },
];

export default function Sidebar() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const items = [...baseItems];
  if (currentUser?.role === 'Leader') {
    items.push({ key: 'members', label: 'members', icon: UsersIcon, to: '/members' });
  }

  return (
    <aside className="w-64 bg-black text-white h-full flex flex-col border-r border-gray-800 shrink-0">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter" style={{ color: IRONTEC_GREEN }}>
          iron<span className="text-white">work</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#e5ff48] text-black font-bold'
                  : 'hover:bg-gray-900 text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-bold uppercase tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 p-2 text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} />
          <span>logout</span>
        </button>
      </div>
    </aside>
  );
}
