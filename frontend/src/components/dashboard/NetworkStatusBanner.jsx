import React from 'react';
import useNetworkStore from '../../stores/networkStore';

const getNetworkStatus = (current) => {
  if (!current) return { status: 'unknown', label: 'LOADING...', subtitle: 'Connecting to network...', color: '#888888' };
  
  const { tps, congestionScore } = current;
  
  if (tps > 2500 && congestionScore < 60) {
    return { 
      status: 'healthy', 
      label: 'NETWORK HEALTHY', 
      subtitle: 'All systems operational',
      color: '#00ff88'
    };
  }
  if (tps > 1000 && congestionScore < 80) {
    return { 
      status: 'degraded', 
      label: 'NETWORK DEGRADED', 
      subtitle: 'Performance degraded - monitoring closely',
      color: '#ffaa00'
    };
  }
  return { 
    status: 'critical', 
    label: 'NETWORK CRITICAL', 
    subtitle: 'Critical issues detected - immediate attention required',
    color: '#ff4444'
  };
};

export default function NetworkStatusBanner() {
  const { current } = useNetworkStore();
  const { status, label, subtitle, color } = getNetworkStatus(current);
  
  const bgGradient = {
    healthy: 'linear-gradient(90deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%)',
    degraded: 'linear-gradient(90deg, rgba(255, 170, 0, 0.05) 0%, rgba(255, 170, 0, 0.02) 100%)',
    critical: 'linear-gradient(90deg, rgba(255, 68, 68, 0.05) 0%, rgba(255, 68, 68, 0.02) 100%)',
    unknown: 'linear-gradient(90deg, rgba(136, 136, 136, 0.05) 0%, rgba(136, 136, 136, 0.02) 100%)'
  };
  
  const borderColor = {
    healthy: 'rgba(0, 255, 136, 0.2)',
    degraded: 'rgba(255, 170, 0, 0.2)',
    critical: 'rgba(255, 68, 68, 0.2)',
    unknown: 'rgba(136, 136, 136, 0.2)'
  };
  
  return (
    <div 
      className="w-full rounded-lg p-6 relative overflow-hidden"
      style={{ 
        background: bgGradient[status],
        border: `1px solid ${borderColor[status]}`,
        boxShadow: `0 0 30px ${color}10`
      }}
    >
      {/* Pulsing glow effect */}
      <div 
        className="absolute top-1/2 left-8 -translate-y-1/2 w-4 h-4 rounded-full animate-pulse-glow"
        style={{ 
          backgroundColor: color,
          opacity: 0.4,
          color: color
        }}
      />
      
      <div className="flex items-center gap-6 pl-10">
        <div>
          <h2 
            className="text-2xl font-bold tracking-wider"
            style={{ color }}
          >
            {label}
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {subtitle}
          </p>
        </div>
        
        {current && (
          <div className="ml-auto flex items-center gap-6 text-sm">
            <div className="text-right">
              <span className="text-text-dim block text-xs uppercase tracking-wider">Slot Height</span>
              <span className="text-text-primary font-mono">{current.slotHeight?.toLocaleString() || '—'}</span>
            </div>
            <div className="text-right">
              <span className="text-text-dim block text-xs uppercase tracking-wider">Timestamp</span>
              <span className="text-text-primary font-mono">
                {current.timestamp ? new Date(current.timestamp).toLocaleTimeString('en-US', { hour12: false }) : '—'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
