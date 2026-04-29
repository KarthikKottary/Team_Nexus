import React from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import StatusBadge from '../components/dashboard/StatusBadge';
import { useAuth } from '../context/AuthContext';

// Import Admin Pages
import Overview from './admin/Overview';
import Teams from './admin/Teams';
import Alerts from './admin/Alerts';
import Projects from './admin/Projects';
import Settings from './admin/Settings';
import Volunteers from './admin/Volunteers';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-wide text-gray-200">System Control Room</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-gray-500 hidden md:block">{user?.name}</span>
            <StatusBadge status="running" />
            <button onClick={handleRefresh} title="Refresh System" className="text-gray-500 hover:text-orange-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </header>

        {/* Dashboard Content Routing */}
        <div className="flex-1 overflow-y-auto p-8 bg-transparent custom-scrollbar">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="teams" element={<Teams />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="projects" element={<Projects />} />
            <Route path="volunteers" element={<Volunteers />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
