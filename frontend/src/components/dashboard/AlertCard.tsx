import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

export interface Alert {
  id: string;
  type: string;
  location: string;
  time: string;
  active: boolean;
}

interface AlertCardProps {
  alert: Alert;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border backdrop-blur-md relative overflow-hidden \${
        alert.active 
          ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]' 
          : 'bg-gray-900/50 border-gray-800'
      }`}
    >
      {alert.active && (
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]" />
      )}
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg \${alert.active ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold tracking-wide \${alert.active ? 'text-red-100' : 'text-gray-300'}`}>
              {alert.type} Alert
            </h3>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {alert.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {alert.time}
              </span>
            </div>
          </div>
        </div>
        {alert.active && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default AlertCard;
