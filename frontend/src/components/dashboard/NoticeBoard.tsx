import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Clock, Info, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import { apiGetNotices, apiCreateNotice } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Notice {
  _id: string;
  title: string;
  message: string;
  targetRole: 'all' | 'admin' | 'participant';
  phase: 'pre-event' | 'hacking' | 'submission' | 'judging' | 'post-event' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  targetTeams?: string[];
}

export const NoticeBoard = ({ teamId }: { teamId?: string }) => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [targetRole, setTargetRole] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.on('new_notice', (newNotice: Notice) => {
      // Check if notice is meant for us based on role
      const roleMatch = newNotice.targetRole === 'all' || newNotice.targetRole === user?.role;
      // Check if notice is meant for us based on team batching
      const teamMatch = !newNotice.targetTeams || newNotice.targetTeams.length === 0 || (teamId && newNotice.targetTeams.includes(teamId));
      
      if (roleMatch && teamMatch) {
        setNotices(prev => [newNotice, ...prev]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, teamId]);

  const fetchNotices = async () => {
    try {
      const res = await apiGetNotices();
      setNotices(res.notices);
    } catch (error) {
      console.error('Failed to load notices', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiCreateNotice({ title, message, phase, priority, targetRole });
      setShowAddForm(false);
      setTitle('');
      setMessage('');
      setPhase('general');
      setPriority('normal');
      setTargetRole('all');
    } catch (error: any) {
      alert(error.message || 'Failed to create notice');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'low': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="bg-gray-950/50 border border-gray-800/50 rounded-xl overflow-hidden flex flex-col h-full relative">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-400" /> System Notices
        </h3>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gray-900/80 border-b border-gray-800"
          >
            <form onSubmit={handleCreate} className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Notice Title (e.g. Lunch in 10 mins)"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-800 rounded py-1.5 px-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Message details..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-800 rounded py-1.5 px-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none h-16"
              />
              <div className="grid grid-cols-3 gap-2">
                <select value={phase} onChange={e => setPhase(e.target.value)} className="bg-gray-950 border border-gray-800 rounded py-1 text-xs text-gray-300">
                  <option value="general">General</option>
                  <option value="pre-event">Pre-Event</option>
                  <option value="hacking">Hacking Phase</option>
                  <option value="submission">Submission Closing</option>
                  <option value="judging">Judging Phase</option>
                </select>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-gray-950 border border-gray-800 rounded py-1 text-xs text-gray-300">
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="bg-gray-950 border border-gray-800 rounded py-1 text-xs text-gray-300">
                  <option value="all">All Roles</option>
                  <option value="participant">Participants Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
              <button disabled={submitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded py-1.5 text-sm font-bold flex justify-center items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Notice'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            No active notices.
          </div>
        ) : (
          <AnimatePresence>
            {notices.map((notice) => (
              <motion.div
                key={notice._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border \${getPriorityColor(notice.priority)} relative`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm leading-tight">{notice.title}</h4>
                  <span className="text-[10px] font-mono opacity-60 ml-2 shrink-0">
                    {new Date(notice.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed mb-2">{notice.message}</p>
                <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider">
                  {notice.phase !== 'general' && (
                    <span className="bg-black/20 px-1.5 py-0.5 rounded">
                      Phase: {notice.phase}
                    </span>
                  )}
                  {notice.targetRole !== 'all' && (
                    <span className="bg-black/20 px-1.5 py-0.5 rounded">
                      To: {notice.targetRole}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
