import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, ShieldAlert, Server } from 'lucide-react';
import { apiGetTeams, apiGetAlerts } from '../../api/client';
import { NoticeBoard } from '../../components/dashboard/NoticeBoard';
import { Leaderboard } from '../../components/dashboard/Leaderboard';

const Overview = () => {
  const [totalTeams, setTotalTeams] = useState(0);
  const [activeTeams, setActiveTeams] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [teamsRes, alertsRes] = await Promise.all([
          apiGetTeams(),
          apiGetAlerts(true) // Get only active alerts
        ]);
        const teams = teamsRes.data || [];
        setTotalTeams(teams.length);
        setActiveTeams(teams.filter((t: any) => t.status === 'active').length);
        setActiveAlerts(alertsRes.data ? alertsRes.data.length : 0);
      } catch (err) {
        console.error("Failed to fetch overview data", err);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Server className="text-blue-400 w-5 h-5" />
        <h2 className="text-lg font-bold uppercase tracking-widest text-gray-200">System Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Teams</h3>
            <Users className="text-blue-400 w-5 h-5" />
          </div>
          <p className="text-4xl font-bold text-gray-100 font-mono">{totalTeams}</p>
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

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[600px]">
          <NoticeBoard />
        </div>
        <div className="h-[600px]">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default Overview;
