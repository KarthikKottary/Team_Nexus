import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Map, Info, X } from 'lucide-react';
import { io } from 'socket.io-client';

export interface EmergencyPayload {
  alertId: string;
  type: string;
  message: string;
  location: string;
  timestamp: string;
  instructions: string[];
  mapUrl?: string;
}

const EmergencyBanner = () => {
  const [emergencies, setEmergencies] = useState<EmergencyPayload[]>([]);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('emergency_broadcast', (payload: EmergencyPayload) => {
      setEmergencies(prev => {
        if (prev.some(e => e.alertId === payload.alertId)) return prev;
        return [payload, ...prev];
      });
    });

    socket.on('emergency_cleared', ({ alertId }: { alertId: string }) => {
      setEmergencies(prev => prev.filter(e => e.alertId !== alertId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (emergencies.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none flex flex-col items-center pt-4 px-4 gap-4">
      <AnimatePresence>
        {emergencies.map((em) => (
          <motion.div
            key={em.alertId}
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-4xl pointer-events-auto bg-red-950/90 border-2 border-red-500 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.5)] backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-widest">{em.type} EMERGENCY: {em.location}</h2>
                  <p className="text-red-100 font-medium">{em.message}</p>
                </div>
              </div>
              <button 
                onClick={() => setEmergencies(prev => prev.filter(e => e.alertId !== em.alertId))}
                className="text-white/50 hover:text-white transition-colors p-2"
                title="Dismiss Banner (Locally)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instructions */}
              <div className="space-y-4">
                <h3 className="text-red-400 font-bold flex items-center gap-2 uppercase tracking-wide">
                  <Info className="w-5 h-5" /> Required Actions
                </h3>
                <ul className="space-y-3">
                  {em.instructions.map((inst, idx) => (
                    <li key={idx} className="bg-red-900/40 border border-red-800/50 p-3 rounded-lg text-red-100 font-medium">
                      {inst}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Map */}
              {em.mapUrl && (
                <div className="space-y-4">
                  <h3 className="text-red-400 font-bold flex items-center gap-2 uppercase tracking-wide">
                    <Map className="w-5 h-5" /> Area Map / Routes
                  </h3>
                  <div className="rounded-xl overflow-hidden border border-red-800/50 relative h-48 bg-gray-900">
                    <img src={em.mapUrl} alt="Emergency Map" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-red-900/20 mix-blend-overlay" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyBanner;
