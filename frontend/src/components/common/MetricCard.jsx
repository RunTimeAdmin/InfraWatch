import React from 'react';

const statusColors = {
  healthy: 'text-accent-green',
  degraded: 'text-accent-amber',
  critical: 'text-accent-red'
};

const statusBgColors = {
  healthy: 'bg-accent-green/10 text-accent-green',
  degraded: 'bg-accent-amber/10 text-accent-amber',
  critical: 'bg-accent-red/10 text-accent-red'
};

const trendColors = {
  up: 'text-accent-green',
  down: 'text-accent-red',
  neutral: 'text-text-muted'
};

const trendIcons = {
  up: '↑',
  down: '↓',
  neutral: '→'
};

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  status = 'healthy', 
  lucideIcon: Icon,
  children 
}) {
  const statusColor = statusColors[status] || statusColors.healthy;
  const statusBg = statusBgColors[status] || statusBgColors.healthy;
  const trendColor = trendColors[trend] || trendColors.neutral;
  const isHealthy = status === 'healthy';

  // Get hex color for value display
  const valueHexColors = {
    healthy: '#00ff88',
    degraded: '#ffaa00',
    critical: '#ff4444'
  };
  const valueColor = valueHexColors[status] || valueHexColors.healthy;

  return (
    <div 
      className={`metric-card rounded-lg p-6 relative
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
      {/* Header: Label left, Icon right */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium">
          {title}
        </p>
        {Icon && (
          <Icon className={`w-5 h-5 ${statusColor}`} />
        )}
      </div>

      {/* Value */}
      <div className="mb-3 relative z-10">
        <p className="text-3xl font-bold text-text-primary" style={{ color: valueColor }}>
          {value}
        </p>
      </div>

      {/* Trend & Status Badge */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${trendColor}`}>
          {trend && trendValue && (
            <>
              {trendIcons[trend]} {trendValue}
            </>
          )}
          {subtitle && !trendValue && subtitle}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${statusBg}`}>
          {status === 'healthy' ? 'Healthy' : status === 'degraded' ? 'Degraded' : 'Critical'}
        </span>
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
