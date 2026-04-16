import React from 'react';
import StatusIndicator from './StatusIndicator';

const statusColors = {
  healthy: '#00ff88',
  degraded: '#ffaa00',
  critical: '#ff4444'
};

const trendIcons = {
  up: '↑',
  down: '↓',
  neutral: '→'
};

const trendColors = {
  up: '#00ff88',
  down: '#ff4444',
  neutral: '#888888'
};

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  status = 'healthy', 
  icon,
  children 
}) {
  const valueColor = statusColors[status] || statusColors.healthy;
  const isHealthy = status === 'healthy';

  return (
    <div 
      className={`metric-card p-6 relative overflow-hidden
                 transition-all duration-300 ease-out
                 ${isHealthy ? 'hover:border-accent-green/30' : 'hover:border-border-accent'}`}
      style={{
        '--value-color': valueColor,
      }}
    >
      {/* Subtle gradient glow for healthy status */}
      {isHealthy && (
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, transparent 50%, rgba(0, 255, 136, 0.05) 100%)',
          }}
        />
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-medium">{title}</p>
        </div>
        {icon && (
          <span className={`text-lg transition-colors duration-200 ${statusColors[status] === '#00ff88' ? 'text-accent-green' : statusColors[status] === '#ffaa00' ? 'text-accent-amber' : 'text-accent-red'}`}>
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mb-3 relative z-10">
        <p className="text-3xl font-bold text-text-primary" style={{ color: valueColor }}>
          {value}
        </p>
      </div>

      {/* Subtitle & Trend */}
      <div className="flex items-center justify-between">
        {trend && trendValue && (
          <span 
            className="text-sm font-medium"
            style={{ color: trendColors[trend] }}
          >
            {trendValue}
          </span>
        )}
        {subtitle && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            status === 'healthy' ? 'bg-accent-green/10 text-accent-green' : 
            status === 'degraded' ? 'bg-accent-amber/10 text-accent-amber' : 
            'bg-accent-red/10 text-accent-red'
          }`}>
            {status === 'healthy' ? 'Healthy' : status === 'degraded' ? 'Degraded' : 'Critical'}
          </span>
        )}
      </div>

      {/* Embedded content (charts, etc.) */}
      {children && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          {children}
        </div>
      )}
    </div>
  );
}
