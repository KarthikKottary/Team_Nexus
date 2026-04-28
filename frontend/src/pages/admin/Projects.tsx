import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GitCommit, RefreshCw, Loader2 } from 'lucide-react';
import { apiGetTeams, apiFetchGithub } from '../../api/client';
import StatusBadge from '../../components/dashboard/StatusBadge';

interface Team {
  _id: string;
  name: string;
  repo: string;
  status: 'active' | 'idle' | 'inactive';
  lastCommitAt: string | null;
}

const Projects = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await apiGetTeams();
        setTeams(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const handleSync = async (teamId: string, repoUrl: string) => {
    if (!repoUrl) return;
    setSyncing(prev => ({ ...prev, [teamId]: true }));
    try {
      await apiFetchGithub({ repoUrl, teamId });
      // Refresh teams data after syncing
      const res = await apiGetTeams();
      setTeams(res.data || []);
    } catch (err: any) {
      console.error('GitHub Sync Error:', err);
      alert(err.message || 'Failed to sync GitHub data. Check if repository is public.');
    } finally {
      setSyncing(prev => ({ ...prev, [teamId]: false }));
    }
  };

  const timeAgo = (iso: string | null) => {
    if (!iso) return 'Never';
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Briefcase className="text-orange-400 w-5 h-5" />
        <h2 className="text-lg font-bold uppercase tracking-widest text-gray-200">Project Tracking</h2>
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
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-600">Loading projects...</td></tr>
            ) : teams.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-600 text-sm">
                  No teams registered yet. Add teams via the API.
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <motion.tr key={team._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-800/20 transition-colors">
                  <td className="p-4 font-medium text-gray-200">{team.name}</td>
                  <td className="p-4 text-gray-400 font-mono text-sm truncate max-w-[250px]">
                    {team.repo ? (
                      <div className="flex items-center gap-2">
                        <a href={team.repo} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors truncate">
                          {team.repo}
                        </a>
                        <button
                          onClick={() => handleSync(team._id, team.repo)}
                          disabled={syncing[team._id]}
                          title="Sync GitHub Commits"
                          className="text-gray-500 hover:text-blue-400 transition-colors disabled:opacity-50"
                        >
                          {syncing[team._id] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="opacity-50">No repo</span>
                    )}
                  </td>
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
  );
};

export default Projects;
