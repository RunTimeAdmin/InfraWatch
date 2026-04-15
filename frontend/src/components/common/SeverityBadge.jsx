import React from 'react';

const severityConfig = {
  critical: {
    bgColor: 'rgba(255, 68, 68, 0.15)',
    borderColor: 'rgba(255, 68, 68, 0.4)',
    textColor: '#ff4444',
    icon: '●',
    label: 'CRITICAL'
  },
  warning: {
    bgColor: 'rgba(255, 170, 0, 0.15)',
    borderColor: 'rgba(255, 170, 0, 0.4)',
    textColor: '#ffaa00',
    icon: '●',
    label: 'WARNING'
  },
  info: {
    bgColor: 'rgba(0, 212, 255, 0.15)',
    borderColor: 'rgba(0, 212, 255, 0.4)',
    textColor: '#00d4ff',
    icon: '●',
    label: 'INFO'
  }
};

export default function SeverityBadge({ severity = 'info' }) {
  const config = severityConfig[severity] || severityConfig.info;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                 border text-xs font-semibold tracking-wide
                 transition-all duration-200"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        color: config.textColor,
        boxShadow: `0 0 8px ${config.borderColor}`
      }}
    >
      <span className="animate-pulse">{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}
