import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, GitBranch, Users, Activity } from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';

const TeamDashboard = () => {
  const [alertSent, setAlertSent] = useState(false);

  const triggerAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-gray-950 to-gray-950 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-gray-900/60 border border-gray-800 rounded-2xl p-8 backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-500 mb-2">
              NeuralKnights
            </h1>
            <p className="text-gray-400 flex items-center gap-2 font-mono text-sm">
              <GitBranch className="w-4 h-4" /> github.com/nk/hack
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-mono text-gray-500">SYSTEM STATUS</span>
            <StatusBadge status="active" label="Project Active" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-950/50 p-5 rounded-xl border border-gray-800/50">
            <h3 className="text-sm text-gray-500 font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Team Members
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>Alice Johnson (Lead)</li>
              <li>Bob Smith (Frontend)</li>
              <li>Charlie Brown (Backend)</li>
            </ul>
          </div>
          <div className="bg-gray-950/50 p-5 rounded-xl border border-gray-800/50">
            <h3 className="text-sm text-gray-500 font-medium mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-300 flex justify-between">
                <span>Commit: fixed auth bug</span>
                <span className="text-gray-500 text-xs font-mono">10m ago</span>
              </div>
              <div className="text-sm text-gray-300 flex justify-between">
                <span>Commit: init repo</span>
                <span className="text-gray-500 text-xs font-mono">2h ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-400 mb-2">Emergency Assistance</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            If you have a medical emergency, security issue, or critical technical failure, trigger an alert immediately.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={triggerAlert}
            disabled={alertSent}
            className={`w-full py-4 rounded-lg font-bold uppercase tracking-widest transition-all duration-300 \${
              alertSent 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
            }`}
          >
            {alertSent ? 'ALERT SENT TO ADMINS' : 'TRIGGER EMERGENCY ALERT'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamDashboard;
