import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, GitBranch, Users, Activity, LogOut, Loader2, CheckCircle } from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { apiCreateAlert } from '../api/client';
import { useNavigate } from 'react-router-dom';

type AlertType = 'Medical' | 'Technical' | 'Security' | 'Fire' | 'Other';

const TeamDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alertSent, setAlertSent] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>('Medical');
  const [alertError, setAlertError] = useState('');

  const handleLogout = () => { logout(); navigate('/auth'); };

  const triggerAlert = async () => {
    setAlertLoading(true);
    setAlertError('');
    try {
      await apiCreateAlert({
        type: alertType,
        location: 'Team Station',
        description: `Emergency triggered by ${user?.name} (${user?.email})`,
      });
      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 6000);
    } catch (err: any) {
      setAlertError(err.message || 'Failed to send alert');
    } finally {
      setAlertLoading(false);
    }
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
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-500 mb-1">
              {user?.name ?? 'Team Portal'}
            </h1>
            <p className="text-gray-400 flex items-center gap-2 font-mono text-sm">
              <GitBranch className="w-4 h-4" /> {user?.email}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-mono text-gray-500 uppercase">System Status</span>
            <StatusBadge status="active" label="Project Active" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors mt-1"
            >
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-950/50 p-5 rounded-xl border border-gray-800/50">
            <h3 className="text-sm text-gray-500 font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Account Info
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><span className="text-gray-500">Name:</span> {user?.name}</li>
              <li><span className="text-gray-500">Email:</span> {user?.email}</li>
              <li>
                <span className="text-gray-500">Role:</span>{' '}
                <span className="capitalize">{user?.role}</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-950/50 p-5 rounded-xl border border-gray-800/50">
            <h3 className="text-sm text-gray-500 font-medium mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Alert Type
            </h3>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as AlertType)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:border-red-500/50 text-sm"
            >
              {(['Medical', 'Technical', 'Security', 'Fire', 'Other'] as AlertType[]).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <p className="text-gray-600 text-xs mt-3">Select the type of emergency before triggering.</p>
          </div>
        </div>

        {/* Emergency Trigger */}
        <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-400 mb-2">Emergency Assistance</h3>
          <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
            If you have a medical emergency, security issue, or critical technical failure, trigger an alert immediately.
          </p>

          {alertError && (
            <p className="text-red-400 text-xs mb-3 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">{alertError}</p>
          )}

          <AnimatePresence mode="wait">
            {alertSent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-lg font-bold uppercase tracking-widest bg-green-500/20 text-green-400 border border-green-500/50"
              >
                <CheckCircle className="w-5 h-5" /> Alert Sent to Admins
              </motion.div>
            ) : (
              <motion.button
                key="btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={triggerAlert}
                disabled={alertLoading}
                className="w-full py-4 rounded-lg font-bold uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
              >
                {alertLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Trigger Emergency Alert
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamDashboard;
