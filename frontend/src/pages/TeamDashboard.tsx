import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, GitBranch, Users, Activity, LogOut, Loader2, CheckCircle, Code, Shield } from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { apiCreateAlert, apiGetMyTeamDetails, apiCreateMyTeam, apiJoinTeam } from '../api/client';
import { useNavigate } from 'react-router-dom';

type AlertType = 'Medical' | 'Technical' | 'Security' | 'Fire' | 'Other';

const TeamDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Team State
  const [team, setTeam] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [teamError, setTeamError] = useState('');

  // Form State
  const [joinCode, setJoinCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [createRepo, setCreateRepo] = useState('');

  // Alert State
  const [alertSent, setAlertSent] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>('Medical');
  const [alertError, setAlertError] = useState('');

  const fetchMyTeam = async () => {
    try {
      setLoadingTeam(true);
      const res = await apiGetMyTeamDetails();
      setTeam(res.data);
    } catch (err: any) {
      setTeam(null);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchMyTeam();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    try {
      await apiCreateMyTeam({ name: createName, repo: createRepo });
      await fetchMyTeam();
    } catch (err: any) {
      setTeamError(err.message || 'Failed to create team.');
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    try {
      await apiJoinTeam({ code: joinCode });
      await fetchMyTeam();
    } catch (err: any) {
      setTeamError(err.message || 'Failed to join team.');
    }
  };

  const triggerAlert = async () => {
    setAlertLoading(true);
    setAlertError('');
    try {
      await apiCreateAlert({
        type: alertType,
        location: 'Team Station',
        description: `Emergency triggered by ${user?.name} (${user?.email})`,
        team: team?._id
      });
      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 6000);
    } catch (err: any) {
      setAlertError(err.message || 'Failed to send alert');
    } finally {
      setAlertLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/auth'); };

  if (loadingTeam) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-gray-950 to-gray-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl bg-gray-900/60 border border-gray-800 rounded-2xl p-8 backdrop-blur-xl relative z-10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-500 mb-1">
              {team ? team.name : 'Participant Portal'}
            </h1>
            <p className="text-gray-400 flex items-center gap-2 font-mono text-sm">
              <GitBranch className="w-4 h-4" /> {team ? team.repo || 'No repo set' : user?.email}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-mono text-gray-500 uppercase">System Status</span>
            <StatusBadge status="active" label={team ? "Project Active" : "Online"} />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors mt-1"
            >
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>

        {!team ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-950/50 p-6 rounded-xl border border-gray-800/50">
              <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Join a Team
              </h3>
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">JOIN CODE</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:border-blue-500/50 font-mono uppercase"
                    placeholder="e.g. A1B2C3"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg text-sm font-bold tracking-wide transition-colors">
                  JOIN TEAM
                </button>
              </form>
            </div>

            <div className="bg-gray-950/50 p-6 rounded-xl border border-gray-800/50">
              <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" /> Create a Team
              </h3>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">TEAM NAME</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:border-green-500/50"
                    placeholder="Alpha Squad"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">GITHUB REPO (Optional)</label>
                  <input
                    type="text"
                    value={createRepo}
                    onChange={(e) => setCreateRepo(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:border-green-500/50"
                    placeholder="https://github.com/user/repo"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-green-600/20 text-green-400 hover:bg-green-600/40 border border-green-500/30 rounded-lg text-sm font-bold tracking-wide transition-colors">
                  CREATE TEAM
                </button>
              </form>
            </div>
            
            {teamError && (
              <div className="md:col-span-2 text-center text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                {teamError}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-gray-950/50 p-5 rounded-xl border border-gray-800/50">
                <h3 className="text-sm text-gray-500 font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Team Members & Code
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm mb-4">
                  {team.members?.map((m: any) => (
                    <li key={m._id} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      {m.name} {m._id === user?._id && <span className="text-gray-600 text-xs">(You)</span>}
                    </li>
                  ))}
                </ul>
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
                  <span className="text-xs text-gray-500">JOIN CODE:</span>
                  <span className="font-mono font-bold text-blue-400 tracking-widest">{team.joinCode}</span>
                </div>
              </div>

              <div className="bg-gray-950/50 p-5 rounded-xl border border-gray-800/50">
                <h3 className="text-sm text-gray-500 font-medium mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Alert Type
                </h3>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as AlertType)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:border-red-500/50 text-sm mb-4"
                >
                  {(['Medical', 'Technical', 'Security', 'Fire', 'Other'] as AlertType[]).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
                  <span className="text-xs text-gray-500">COMMITS:</span>
                  <span className="font-mono font-bold text-green-400">{team.recentCommits?.length || 0}</span>
                </div>
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
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TeamDashboard;
