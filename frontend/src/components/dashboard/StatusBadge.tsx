import React from 'react';

type StatusType = 'active' | 'idle' | 'inactive' | 'running' | 'alert' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  animate?: boolean;
}

const statusConfig = {
  active: { color: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10', defaultLabel: 'Active' },
  running: { color: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10', defaultLabel: 'Running' },
  idle: { color: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', defaultLabel: 'Idle' },
  inactive: { color: 'bg-gray-500', text: 'text-gray-400', border: 'border-gray-500/30', bg: 'bg-gray-500/10', defaultLabel: 'Inactive' },
  alert: { color: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10', defaultLabel: 'Alert Active' },
  pending: { color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', defaultLabel: 'Pending' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, animate = true }) => {
  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border \${config.border} \${config.bg}` }>
      <div className="relative flex h-2 w-2">
        {animate && status !== 'inactive' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${config.color}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 \${config.color}`}></span>
      </div>
      <span className={`text-xs font-semibold tracking-wider uppercase \${config.text}`}>
        {label || config.defaultLabel}
      </span>
    </div>
  );
};

export default StatusBadge;
