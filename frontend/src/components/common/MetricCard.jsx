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
      className={`bg-bg-card border rounded-lg p-4 
                 hover:scale-[1.01] transition-all duration-300 ease-out
                 metric-card relative overflow-hidden
                 ${isHealthy ? 'border-border-subtle hover:border-accent-green/20' : 'border-border-subtle hover:border-border-accent'}`}
      style={{
        '--value-color': valueColor,
      }}
    >
      {/* Subtle gradient glow for healthy status */}
      {isHealthy && (
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.02) 0%, transparent 50%, rgba(0, 255, 136, 0.02) 100%)',
          }}
        />
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-text-muted text-lg">{icon}</span>
          )}
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {title}
          </span>
        </div>
        <StatusIndicator status={status} size="sm" />
      </div>

      {/* Value */}
      <div className="mb-2 relative z-10">
        <span 
          className="text-3xl font-bold tracking-tight metric-value"
          style={{ 
            color: valueColor,
            transition: 'color 0.3s ease, text-shadow 0.3s ease',
            textShadow: `0 0 20px ${valueColor}20`
          }}
        >
          {value}
        </span>
      </div>

      {/* Subtitle & Trend */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <span className="text-sm text-text-dim">
            {subtitle}
          </span>
        )}
        {trend && trendValue && (
          <div 
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: trendColors[trend] }}
          >
            <span>{trendIcons[trend]}</span>
            <span>{trendValue}</span>
          </div>
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
