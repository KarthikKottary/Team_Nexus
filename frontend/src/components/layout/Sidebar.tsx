import React from 'react';
import { LayoutDashboard, Users, AlertTriangle, Briefcase, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Teams', icon: Users, path: '/admin/teams' },
    { name: 'Alerts', icon: AlertTriangle, path: '/admin/alerts' },
    { name: 'Projects', icon: Briefcase, path: '/admin/projects' },
    { name: 'Volunteers', icon: Users, path: '/admin/volunteers' },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-950 border-r border-gray-800 flex flex-col relative z-20">
      <div className="p-6 flex items-center h-20 w-full">
        {/* Placeholder for the globally Animated Logo Intro to land */}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <div className="text-xs font-mono text-gray-500 mb-4 px-2 tracking-widest">MAIN MENU</div>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group \${
                isActive 
                  ? 'bg-gray-800/50 text-orange-400 border border-orange-500/20 shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]' 
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 \${isActive ? 'text-orange-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              <span className="font-medium tracking-wide">{link.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-gray-900">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
        <button 
          onClick={() => { logout(); navigate('/auth'); }}
          className="w-full flex items-center gap-3 px-3 py-2 mt-1 text-gray-400 hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-950/30"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
