import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Server, Activity, GitCommit, Users } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import StatusBadge from '@/components/dashboard/StatusBadge';
import AlertCard, { Alert } from '@/components/dashboard/AlertCard';

const mockAlerts: Alert[] = [
  { id: '1', type: 'Medical', location: 'Section B, Table 12', time: 'Just now', active: true },
  { id: '2', type: 'Technical', location: 'Server Room', time: '10m ago', active: false },
];

const mockTeams = [
  { id: '1', name: 'NeuralKnights', repo: 'github.com/nk/hack', lastCommit: '2m ago', status: 'active' as const },
  { id: '2', name: 'CodeCrafters', repo: 'github.com/cc/app', lastCommit: '1h ago', status: 'idle' as const },
  { id: '3', name: 'SyntaxError', repo: 'github.com/se/bot', lastCommit: '5h ago', status: 'inactive' as const },
];

const AdminDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-wide text-gray-200">System Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-gray-500">SYS_STATUS:</span>
            <StatusBadge status="running" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stats Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Total Teams</h3>
                <Users className="text-blue-400 w-5 h-5" />
              </div>
              <p className="text-4xl font-bold text-gray-100 font-mono">42</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-medium">Active Teams</h3>
                <Activity className="text-green-400 w-5 h-5" />
              </div>
              <p className="text-4xl font-bold text-gray-100 font-mono">38</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-red-400 font-medium">Active Alerts</h3>
                <ShieldAlert className="text-red-500 w-5 h-5" />
              </div>
              <p className="text-4xl font-bold text-red-500 font-mono">1</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Emergency Alerts Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="text-red-500 w-5 h-5 animate-pulse" />
                <h2 className="text-lg font-bold uppercase tracking-widest text-gray-200">Emergency Alerts</h2>
              </div>
              <div className="space-y-4">
                {mockAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
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
                    {mockTeams.map(team => (
                      <motion.tr key={team.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-800/20 transition-colors">
                        <td className="p-4 font-medium text-gray-200">{team.name}</td>
                        <td className="p-4 text-gray-400 font-mono text-sm">{team.repo}</td>
                        <td className="p-4 text-gray-400 text-sm flex items-center gap-2">
                          <GitCommit className="w-3 h-3" /> {team.lastCommit}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={team.status} />
                        </td>
                      </motion.tr>
                    ))}
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
