import React from 'react';
import { TrendingUp } from 'lucide-react';
import useNetworkStore from '../../stores/networkStore';

const getScoreLabel = (score) => {
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Moderate';
  if (score <= 80) return 'High';
  return 'Critical';
};

const getScoreColor = (score) => {
  if (score <= 30) return '#00ff88';
  if (score <= 60) return '#ffaa00';
  return '#ff4444';
};

const getScoreStatus = (score) => {
  if (score <= 30) return 'healthy';
  if (score <= 60) return 'degraded';
  return 'critical';
};

// Get gradient colors for smooth transition
const getGradientColors = (score) => {
  if (score <= 30) return ['#00ff88', '#00cc6a'];
  if (score <= 60) return ['#ffaa00', '#ff8800'];
  if (score <= 80) return ['#ff6600', '#ff4444'];
  return ['#ff4444', '#ff2222'];
};

export default function CongestionScoreCard() {
  const { current } = useNetworkStore();
  
  // Check both camelCase and snake_case field names, and treat 0 as a valid score
  const rawScore = current?.congestionScore ?? current?.congestion_score;
  const score = rawScore !== undefined && rawScore !== null ? rawScore : null;
  const displayScore = score !== null ? Math.round(score) : '—';
  const label = score !== null ? getScoreLabel(score) : '—';
  const color = score !== null ? getScoreColor(score) : '#888888';
  const status = score !== null ? getScoreStatus(score) : 'healthy';
  const [gradientStart, gradientEnd] = score !== null ? getGradientColors(score) : ['#888888', '#666666'];
  
  // SVG semi-circle gauge
  const radius = 36;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI; // Semi-circle
  const strokeDashoffset = score !== null 
    ? circumference - (Math.min(score, 100) / 100) * circumference 
    : circumference;
  
  // Calculate endpoint position for glow effect
  const getEndpointPosition = (scoreValue) => {
    const angle = Math.PI * (1 - scoreValue / 100); // 0-100 maps to PI-0
    const x = 40 + normalizedRadius * Math.cos(angle);
    const y = 42 - normalizedRadius * Math.sin(angle);
    return { x, y };
  };
  
  const endpoint = score !== null ? getEndpointPosition(score) : { x: 6, y: 42 };
  
  return (
    <div className="metric-card rounded-lg p-6 relative overflow-hidden">
      {/* Header: Label left, Icon right */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium">
          Congestion Score
        </p>
        <TrendingUp className={`w-5 h-5 ${status === 'healthy' ? 'text-accent-green' : status === 'degraded' ? 'text-accent-amber' : 'text-accent-red'}`} />
      </div>
      
      {/* Gauge */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative w-20 h-14">
          <svg width="80" height="56" viewBox="0 0 80 56">
            <defs>
              {/* Gradient for the arc */}
              <linearGradient id="congestionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientStart} />
                <stop offset="100%" stopColor={gradientEnd} />
              </linearGradient>
              {/* Glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Background arc */}
            <path
              d={`M 6 42 A ${normalizedRadius} ${normalizedRadius} 0 0 1 74 42`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Foreground arc with gradient */}
            {score !== null && (
              <>
                <path
                  d={`M 6 42 A ${normalizedRadius} ${normalizedRadius} 0 0 1 74 42`}
                  fill="none"
                  stroke="url(#congestionGradient)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  style={{ 
                    transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease',
                    filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.3))'
                  }}
                />
                {/* Glowing endpoint */}
                <circle
                  cx={endpoint.x}
                  cy={endpoint.y}
                  r="4"
                  fill={color}
                  filter="url(#glow)"
                  style={{
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: 0.9
                  }}
                />
              </>
            )}
          </svg>
          {/* Score in center */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <span 
              className="text-xl font-bold transition-all duration-300"
              style={{ 
                color,
                textShadow: `0 0 10px ${color}40`
              }}
            >
              {displayScore}
            </span>
          </div>
        </div>
        
        {/* Label */}
        <div>
          <span 
            className="text-sm font-medium uppercase tracking-wide transition-colors duration-300"
            style={{ color }}
          >
            {label}
          </span>
          <p className="text-xs text-text-dim mt-1">
            0-100 scale
          </p>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="flex items-center justify-end mt-3">
        <span className={`text-xs px-2 py-1 rounded-full ${status === 'healthy' ? 'bg-accent-green/10 text-accent-green' : status === 'degraded' ? 'bg-accent-amber/10 text-accent-amber' : 'bg-accent-red/10 text-accent-red'}`}>
          {status === 'healthy' ? 'Healthy' : status === 'degraded' ? 'Degraded' : 'Critical'}
        </span>
      </div>
    </div>
  );
}
