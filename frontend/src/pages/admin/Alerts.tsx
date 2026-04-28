import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { apiGetAlerts, apiResolveAlert } from '../../api/client';
import AlertCard, { Alert } from '../../components/dashboard/AlertCard';
import { io } from 'socket.io-client';

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await apiGetAlerts();
      setAlerts((res.data || []).map((a: any) => ({
        id: a._id,
        type: a.type,
        location: a.location,
        time: a.timeAgo || 'Just now',
        active: a.active,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const socket = io('http://localhost:5000');

    socket.on('new_alert', (newAlert: any) => {
      setAlerts((prev) => [
        {
          id: newAlert._id,
          type: newAlert.type,
          location: newAlert.location,
          time: 'Just now',
          active: newAlert.active,
        },
        ...prev,
      ]);
    });

    socket.on('alert_resolved', (resolvedAlert: any) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === resolvedAlert._id ? { ...a, active: false } : a))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await apiResolveAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: false } : a)));
    } catch (err) {
      console.error("Failed to resolve alert");
    }
  };

  const activeAlerts = alerts.filter(a => a.active);
  const resolvedAlerts = alerts.filter(a => !a.active);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="text-red-500 w-5 h-5 animate-pulse" />
          <h2 className="text-lg font-bold uppercase tracking-widest text-red-400">Active Emergencies</h2>
        </div>
        
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-20 bg-gray-800 rounded"></div>
            </div>
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="p-6 bg-green-950/20 border border-green-900/50 rounded-xl text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-400 font-medium">All clear. No active emergencies.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="relative">
                <AlertCard alert={alert} />
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="absolute top-4 right-4 bg-green-500/20 text-green-400 hover:bg-green-500/40 border border-green-500/50 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                >
                  Mark as Resolved
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-6 opacity-70">
          <ShieldAlert className="text-gray-500 w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-500">Alert History</h2>
        </div>
        <div className="space-y-4 opacity-60">
          {resolvedAlerts.slice(0, 10).map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
