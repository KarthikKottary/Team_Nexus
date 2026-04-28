import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Globe } from 'lucide-react';
import { apiGetTeams } from '../../api/client';
import StatusBadge from '../../components/dashboard/StatusBadge';

const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="text-purple-400 w-5 h-5" />
        <h2 className="text-lg font-bold uppercase tracking-widest text-gray-200">Team Directory</h2>
      </div>

      {loading ? (
        <div className="text-gray-500 animate-pulse">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="text-gray-500 p-8 text-center bg-gray-900/40 rounded-xl border border-gray-800">
          No teams available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <motion.div key={team._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-100">{team.name}</h3>
                <StatusBadge status={team.status} />
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span>{team.college_name || 'No College Provided'}</span>
                </div>
                {team.repo && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a href={team.repo} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate">
                      Repository
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-mono tracking-widest text-gray-500 mb-2">MEMBERS ({team.members?.length || 0})</h4>
                <div className="flex flex-wrap gap-2">
                  {team.members?.map((m: any) => (
                    <span key={m._id} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700">
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
