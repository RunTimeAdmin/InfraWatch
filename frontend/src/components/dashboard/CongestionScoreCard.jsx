import React from 'react';
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
    <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent hover:scale-[1.01] transition-all duration-300 ease-out relative overflow-hidden">
      {/* Subtle gradient border glow for healthy status */}
      {score !== null && score <= 30 && (
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.03) 0%, transparent 50%, rgba(0, 255, 136, 0.03) 100%)',
          }}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Congestion Score
        </span>
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
    </div>
  );
}
