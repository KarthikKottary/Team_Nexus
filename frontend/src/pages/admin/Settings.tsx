import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiExportReport } from '../../api/client';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="text-gray-400 w-5 h-5" />
        <h2 className="text-lg font-bold uppercase tracking-widest text-gray-200">System Settings</h2>
      </div>

      <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-gray-800 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center border border-blue-500/30">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-100">{user?.name}</h3>
            <p className="text-gray-500 font-mono text-sm">{user?.email}</p>
            <span className="inline-block mt-2 text-xs uppercase tracking-widest bg-blue-900/30 text-blue-400 px-2 py-1 rounded border border-blue-800/50">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-gray-300 font-bold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-gray-500" /> Notifications</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm text-gray-400">
                <span>Receive email alerts for emergencies</span>
                <input type="checkbox" className="form-checkbox text-blue-500 rounded bg-gray-900 border-gray-700" defaultChecked />
              </label>
              <label className="flex items-center justify-between text-sm text-gray-400">
                <span>Browser push notifications</span>
                <input type="checkbox" className="form-checkbox text-blue-500 rounded bg-gray-900 border-gray-700" defaultChecked />
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800">
            <h4 className="text-gray-300 font-bold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-gray-500" /> Security</h4>
            <button className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded transition-colors border border-gray-700">
              Change Password
            </button>
          </div>

          <div className="pt-6 border-t border-gray-800">
            <h4 className="text-gray-300 font-bold mb-4 flex items-center gap-2"><Download className="w-4 h-4 text-gray-500" /> Data Export</h4>
            <button 
              onClick={async () => {
                try {
                  const blob = await apiExportReport();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'hackathon_report.csv';
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  alert('Failed to export report');
                }
              }}
              className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors shadow-lg"
            >
              <Download className="w-4 h-4" /> Download System Report (CSV)
            </button>
            <p className="text-xs text-gray-500 mt-2">Export a consolidated CSV containing all active/resolved emergencies and team project statuses.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
