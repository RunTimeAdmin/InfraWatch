import React from 'react';

const statusConfig = {
  healthy: {
    color: '#00ff88',
    label: 'HEALTHY'
  },
  degraded: {
    color: '#ffaa00',
    label: 'DEGRADED'
  },
  critical: {
    color: '#ff4444',
    label: 'CRITICAL'
  }
};

const sizeConfig = {
  sm: {
    dot: 'w-2 h-2',
    glow: 'w-4 h-4',
    text: 'text-xs'
  },
  md: {
    dot: 'w-3 h-3',
    glow: 'w-6 h-6',
    text: 'text-sm'
  },
  lg: {
    dot: 'w-4 h-4',
    glow: 'w-8 h-8',
    text: 'text-base'
  }
};

export default function StatusIndicator({ status = 'healthy', label, size = 'md' }) {
  const config = statusConfig[status] || statusConfig.healthy;
  const sizes = sizeConfig[size] || sizeConfig.md;
  const displayLabel = label || config.label;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        {/* Glow effect */}
        <div
          className={`absolute ${sizes.glow} rounded-full animate-pulse-glow`}
          style={{ 
            backgroundColor: config.color,
            opacity: 0.3,
            color: config.color
          }}
        />
        {/* Dot */}
        <div
          className={`relative ${sizes.dot} rounded-full`}
          style={{ backgroundColor: config.color }}
        />
      </div>
      {displayLabel && (
        <span 
          className={`${sizes.text} font-medium tracking-wide`}
          style={{ color: config.color }}
        >
          {displayLabel}
        </span>
      )}
    </div>
  );
}
