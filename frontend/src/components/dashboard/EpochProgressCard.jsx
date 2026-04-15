import React from 'react';
import useNetworkStore from '../../stores/networkStore';
import { formatNumber, formatEpochEta } from '../../utils/formatters';

export default function EpochProgressCard() {
  const { epochInfo, current } = useNetworkStore();
  
  // Use epochInfo if available, fallback to current data
  const epoch = epochInfo?.epoch ?? current?.epoch ?? null;
  // Normalize progress to a 0-100 percentage
  let progressPercent = null;
  const rawProgress = epochInfo?.progress ?? current?.epochProgress ?? current?.epoch_progress ?? null;
  if (rawProgress !== null && rawProgress !== undefined) {
    // If > 1, it's already a 0-100 percentage. If <= 1, it's a 0-1 decimal.
    progressPercent = rawProgress > 1 ? Math.round(rawProgress) : Math.round(rawProgress * 100);
    // Clamp to 0-100
    progressPercent = Math.max(0, Math.min(100, progressPercent));
  }
  const slotsRemaining = epochInfo?.slotsRemaining ?? current?.slotsRemaining ?? current?.slots_remaining ?? null;
  const eta = slotsRemaining !== null ? formatEpochEta(slotsRemaining) : '—';
  
  return (
    <div className="bg-bg-card border border-border-subtle rounded-lg p-6 hover:border-border-accent transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Epoch Progress
          </span>
          <h3 className="text-2xl font-bold text-text-primary mt-1">
            Epoch {epoch !== null ? formatNumber(epoch) : '—'}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-text-muted uppercase tracking-wider block">
            Remaining
          </span>
          <span className="text-lg font-mono text-accent-green">
            {eta}
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative">
        <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden relative">
          {/* Animated shimmer on the leading edge */}
          {progressPercent !== null && progressPercent > 0 && (
            <div 
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{ 
                left: `calc(${progressPercent}% - 40px)`,
                width: '40px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 255, 136, 0.4) 50%, transparent 100%)',
                animation: 'shimmer-slide 2s ease-in-out infinite',
              }}
            />
          )}
          <div 
            className="h-full bg-gradient-to-r from-accent-green-dim to-accent-green rounded-full transition-all duration-500 relative"
            style={{ width: progressPercent !== null ? `${progressPercent}%` : '0%' }}
          >
            {/* Subtle glow on the progress bar */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-2"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3))',
                borderRadius: '0 9999px 9999px 0'
              }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-text-dim">
          <span>0%</span>
          <span className="text-accent-green font-medium">
            {progressPercent !== null ? `${progressPercent}%` : '—'}
          </span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Additional stats */}
      {epochInfo && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border-subtle">
          <div>
            <span className="text-xs text-text-dim uppercase tracking-wider block">Slot Index</span>
            <span className="text-sm text-text-primary font-mono">{formatNumber(epochInfo.slotIndex)}</span>
          </div>
          <div>
            <span className="text-xs text-text-dim uppercase tracking-wider block">Slots in Epoch</span>
            <span className="text-sm text-text-primary font-mono">{formatNumber(epochInfo.slotsInEpoch)}</span>
          </div>
          <div>
            <span className="text-xs text-text-dim uppercase tracking-wider block">Slots Remaining</span>
            <span className="text-sm text-text-primary font-mono">{formatNumber(epochInfo.slotsRemaining)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
