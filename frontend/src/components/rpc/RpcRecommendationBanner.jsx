import React from 'react';

export default function RpcRecommendationBanner({ recommendation }) {
  if (!recommendation) return null;

  const { name, latencyMs } = recommendation;
  
  // Validate latency value - if unrealistic (>10s) or not a number, don't show banner
  if (!latencyMs || latencyMs > 10000 || latencyMs < 0 || !isFinite(latencyMs)) {
    return null;
  }
  
  const threshold = Math.ceil(latencyMs / 50) * 50;

  return (
    <div className="relative overflow-hidden rounded-lg border border-accent-cyan/30 bg-bg-secondary">
      {/* Glow effect */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent)'
        }}
      />
      
      <div className="relative px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-cyan/10 border border-accent-cyan/30">
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: '#00d4ff' }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>
          
          <div>
            <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
              Fastest Right Now
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-accent-cyan">
                {name}
              </span>
              <span className="text-lg font-semibold text-text-primary">
                ({latencyMs}ms)
              </span>
            </div>
          </div>
        </div>
        
        <div className="hidden sm:block text-right">
          <div className="text-xs text-text-muted">
            Switch if you need sub-{threshold}ms confirmation
          </div>
        </div>
      </div>
    </div>
  );
}
