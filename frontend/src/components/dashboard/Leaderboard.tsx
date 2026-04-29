import React, { useEffect, useState } from 'react';
import { apiGetLeaderboard, apiGetPredictions } from '../../api/client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Trophy, TrendingUp, Activity, Award, AlertTriangle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, predictionsRes] = await Promise.all([
          apiGetLeaderboard(),
          apiGetPredictions()
        ]);
        setLeaderboard(leaderboardRes.leaderboard);
        setInsights(leaderboardRes.insights);
        setPredictions(predictionsRes.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: leaderboard.slice(0, 5).map(team => team.name),
    datasets: [
      {
        label: 'Innovation',
        data: leaderboard.slice(0, 5).map(team => team.scores?.innovation || 0),
        backgroundColor: 'rgba(168, 85, 247, 0.8)', // purple-500
      },
      {
        label: 'Technical',
        data: leaderboard.slice(0, 5).map(team => team.scores?.technical || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500
      },
      {
        label: 'Impact',
        data: leaderboard.slice(0, 5).map(team => team.scores?.impact || 0),
        backgroundColor: 'rgba(236, 72, 153, 0.8)', // pink-500
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: 'rgba(255,255,255,0.7)' }
      },
      title: {
        display: false
      },
    },
    scales: {
      x: { stacked: true, ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } },
      y: { stacked: true, ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
    },
  };

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center text-gray-500 animate-pulse">Loading Leaderboard...</div>;
  }

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 h-full flex flex-col backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" /> Leaderboard Ranking
        </h3>
      </div>
      
      {/* Insights Row */}
      {insights && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-900/20 border border-purple-500/20 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-purple-300/70 font-mono uppercase tracking-wider mb-1">Rising Star</p>
              <p className="text-lg font-bold text-purple-200">{insights.risingTeam?.name || 'N/A'}</p>
            </div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-blue-300/70 font-mono uppercase tracking-wider mb-1">Most Active</p>
              <p className="text-lg font-bold text-blue-200">
                {insights.mostActiveTeam?.name || 'N/A'}
                {insights.mostActiveTeam && <span className="text-xs font-normal text-gray-500 ml-2">({insights.mostActiveTeam.commits || 0} commits)</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="min-h-[220px] w-full shrink-0">
        {leaderboard.length > 0 ? (
           <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">No teams graded yet.</div>
        )}
      </div>
      
      {/* Scrollable Content Container */}
      <div className="overflow-y-auto mt-4 pr-2 custom-scrollbar flex-1 pb-4">
        {/* Top 3 List */}
        <div className="grid grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((team, idx) => (
            <motion.div 
              key={team._id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-3 rounded-lg border \${idx === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : idx === 1 ? 'bg-gray-400/10 border-gray-400/30' : 'bg-orange-500/10 border-orange-500/30'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Award className={`w-4 h-4 \${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : 'text-orange-400'}`} />
                <span className="font-bold text-sm text-gray-200 truncate">{team.name}</span>
              </div>
              <div className="text-xs text-gray-400 font-mono">Score: {team.scores?.total || 0}</div>
            </motion.div>
          ))}
        </div>

        {/* AI Predictions */}
        {predictions && (predictions.topPerformers?.length > 0 || predictions.atRiskTeams?.length > 0) && (
          <div className="mt-6 border-t border-gray-800 pt-6">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">System Predictions</h4>
            <div className="space-y-3">
              {predictions.topPerformers?.slice(0, 2).map((tp: any) => (
                <div key={tp.teamId} className="flex items-start gap-3 bg-green-900/10 border border-green-500/20 p-3 rounded-lg">
                  <Star className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-300">{tp.name} (Predicted Winner)</p>
                    <p className="text-xs text-green-400/70 mt-1">{tp.reason}</p>
                  </div>
                </div>
              ))}
              
              {predictions.atRiskTeams?.slice(0, 2).map((risk: any) => (
                <div key={risk.teamId} className="flex items-start gap-3 bg-red-900/10 border border-red-500/20 p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-300">{risk.name} (At-Risk)</p>
                    <p className="text-xs text-red-400/70 mt-1">{risk.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
