import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium border border-blue-800/50">
        <Activity className="w-4 h-4" />
        <span>ACTIVE EVENT MONITORING SYSTEM</span>
      </div>
      
      <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
        Manage Hackathons<br className="hidden md:block" /> in Real-Time
      </h1>
      
      <p className="text-xl text-gray-400 mb-10 max-w-2xl">
        Monitor teams, track projects, and respond instantly to emergencies. Welcome to Mission Control.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={() => navigate('/auth')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
        >
          Get Started
        </button>
        <button 
          onClick={() => navigate('/admin')}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
};

export default Landing;
