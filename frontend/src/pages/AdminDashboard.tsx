import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Server, Activity, GitCommit, Users, LogOut, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import StatusBadge from '@/components/dashboard/StatusBadge';
import AlertCard, { Alert } from '@/components/dashboard/AlertCard';
import { useAuth } from '../context/AuthContext';
import { apiGetTeams, apiGetAlerts, apiResolveAlert } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

interface Team {
  _id: string;
  name: string;
  repo: string;
  status: 'active' | 'idle' | 'inactive';
  lastCommitAt: string | null;
  recentCommits: { message: string; author: string; timestamp: string }[];
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsRes, alertsRes] = await Promise.all([
        apiGetTeams(),
        apiGetAlerts(),
      ]);
      setTeams(teamsRes.data ?? []);
      // Map API shape → AlertCard shape
      setAlerts(
        (alertsRes.data ?? []).map((a: any) => ({
          id: a._id,
          type: a.type,
          location: a.location,
          time: a.timeAgo ?? 'Just now',
          active: a.active,
        }))
      );
    } catch {
      // If alerts fail (e.g. no DB), just keep mock data empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup Socket.io
    const socket = io('http://localhost:5000');

    socket.on('new_alert', (newAlert: any) => {
      setAlerts((prev) => [
        {
          id: newAlert._id,
          type: newAlert.type,
          location: newAlert.location,
          time: 'Just now',
          active: newAlert.active,
        },
        ...prev,
      ]);
    });

    socket.on('alert_resolved', (resolvedAlert: any) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === resolvedAlert._id ? { ...a, active: false } : a))
      );
    });

    socket.on('team_updated', (updatedTeam: Team) => {
      setTeams((prev) =>
        prev.map((t) => (t._id === updatedTeam._id ? updatedTeam : t))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await apiResolveAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: false } : a)));
    } catch {}
  };

  const handleLogout = () => { logout(); navigate('/auth'); };

  const activeAlerts = alerts.filter((a) => a.active).length;
  const activeTeams = teams.filter((t) => t.status === 'active').length;

  const timeAgo = (iso: string | null) => {
    if (!iso) return 'Never';
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-wide text-gray-200">System Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-gray-500 hidden md:block">{user?.name}</span>
            <StatusBadge status="running" />
            <button onClick={fetchData} title="Refresh" className="text-gray-500 hover:text-orange-400 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Total Teams</h3>
                <Users className="text-blue-400 w-5 h-5" />
              </div>
              <p className="text-4xl font-bold text-gray-100 font-mono">{teams.length}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Active Teams</h3>
                <Activity className="text-green-400 w-5 h-5" />
              </div>
              <p className="text-4xl font-bold text-gray-100 font-mono">{activeTeams}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-red-400 font-medium">Active Alerts</h3>
                <ShieldAlert className="text-red-500 w-5 h-5" />
              </div>
              <p className="text-4xl font-bold text-red-500 font-mono">{activeAlerts}</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Emergency Alerts Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="text-red-500 w-5 h-5 animate-pulse" />
                <h2 className="text-lg font-bold uppercase tracking-widest text-gray-200">Emergency Alerts</h2>
              </div>
              {alerts.length === 0 ? (
                <p className="text-gray-600 text-sm">No alerts yet.</p>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="relative">
                      <AlertCard alert={alert} />
                      {alert.active && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="mt-1 text-xs text-gray-500 hover:text-green-400 transition-colors"
                        >
                          ✓ Mark as resolved
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Activity Panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Server className="text-orange-400 w-5 h-5" />
                <h2 className="text-lg font-bold uppercase tracking-widest text-gray-200">Project Activity</h2>
              </div>

              <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-950/50 border-b border-gray-800">
                    <tr>
                      <th className="p-4 text-xs font-mono tracking-wider text-gray-500">TEAM</th>
                      <th className="p-4 text-xs font-mono tracking-wider text-gray-500">REPOSITORY</th>
                      <th className="p-4 text-xs font-mono tracking-wider text-gray-500">LAST COMMIT</th>
                      <th className="p-4 text-xs font-mono tracking-wider text-gray-500">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {teams.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-600 text-sm">
                          No teams registered yet. Add teams via the API.
                        </td>
                      </tr>
                    ) : (
                      teams.map((team) => (
                        <motion.tr key={team._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-800/20 transition-colors">
                          <td className="p-4 font-medium text-gray-200">{team.name}</td>
                          <td className="p-4 text-gray-400 font-mono text-sm truncate max-w-[180px]">{team.repo}</td>
                          <td className="p-4 text-gray-400 text-sm flex items-center gap-2">
                            <GitCommit className="w-3 h-3 shrink-0" />
                            {timeAgo(team.lastCommitAt)}
                          </td>
                          <td className="p-4">
                            <StatusBadge status={team.status} />
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
