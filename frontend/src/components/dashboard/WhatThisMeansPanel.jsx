import React from 'react';
import useNetworkStore from '../../stores/networkStore';
import { formatNumber } from '../../utils/formatters';

const getNetworkStatus = (current) => {
  if (!current) return 'unknown';
  
  const { tps, congestionScore } = current;
  
  if (tps > 1500 && congestionScore < 60) return 'healthy';
  if (tps > 500 && congestionScore < 80) return 'degraded';
  return 'critical';
};

const getSummary = (current) => {
  if (!current) {
    return 'Loading network data...';
  }
  
  const status = getNetworkStatus(current);
  const { tps, delinquentCount, congestionScore, confirmationTimeMs } = current;
  
  switch (status) {
    case 'healthy':
      return `Solana network is operating normally. Transaction throughput is healthy at ${formatNumber(Math.round(tps))} TPS with normal confirmation times. The network has low congestion (${Math.round(congestionScore || 0)}/100) and all systems are performing within expected parameters.`;
    
    case 'degraded':
      return `Network showing signs of congestion. TPS has dropped to ${formatNumber(Math.round(tps))} with a congestion score of ${Math.round(congestionScore || 0)}/100. Consider using priority fees for time-sensitive transactions. Confirmation times may be slightly elevated at ${Math.round(confirmationTimeMs || 0)}ms.`;
    
    case 'critical':
      return `Significant network issues detected. ${delinquentCount || 0} validators are delinquent. TPS has fallen to ${formatNumber(Math.round(tps))} with high congestion (${Math.round(congestionScore || 0)}/100). Transaction confirmation may be significantly delayed. Monitor closely for resolution.`;
    
    default:
      return 'Unable to determine network status.';
  }
};

const getStatusColor = (current) => {
  const status = getNetworkStatus(current);
  switch (status) {
    case 'healthy': return '#00ff88';
    case 'degraded': return '#ffaa00';
    case 'critical': return '#ff4444';
    default: return '#888888';
  }
};

export default function WhatThisMeansPanel() {
  const { current } = useNetworkStore();
  
  const summary = getSummary(current);
  const statusColor = getStatusColor(current);
  
  return (
    <div className="bg-bg-tertiary border border-border-subtle rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
        />
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
          What This Means
        </h3>
      </div>
      
      <p className="text-sm text-text-primary leading-relaxed">
        {summary}
      </p>
      
      {current && (
        <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-text-dim uppercase tracking-wider block">TPS Status</span>
            <span 
              className="text-sm font-medium"
              style={{ color: current.tps > 2000 ? '#00ff88' : current.tps > 1000 ? '#ffaa00' : '#ff4444' }}
            >
              {current.tps > 2000 ? 'Optimal' : current.tps > 1000 ? 'Reduced' : 'Poor'}
            </span>
          </div>
          <div>
            <span className="text-xs text-text-dim uppercase tracking-wider block">Congestion</span>
            <span 
              className="text-sm font-medium"
              style={{ color: current.congestionScore < 30 ? '#00ff88' : current.congestionScore < 60 ? '#ffaa00' : '#ff4444' }}
            >
              {current.congestionScore < 30 ? 'Low' : current.congestionScore < 60 ? 'Moderate' : 'High'}
            </span>
          </div>
          <div>
            <span className="text-xs text-text-dim uppercase tracking-wider block">Validators</span>
            <span 
              className="text-sm font-medium"
              style={{ color: current.delinquent_count === 0 ? '#00ff88' : '#ff4444' }}
            >
              {(current.delinquentCount ?? current.delinquent_count ?? 0) === 0 ? 'All Healthy' : `${current.delinquentCount ?? current.delinquent_count ?? 0} Delinquent`}
            </span>
          </div>
          <div>
            <span className="text-xs text-text-dim uppercase tracking-wider block">Confirmation</span>
            <span 
              className="text-sm font-medium"
              style={{ color: current.confirmationTimeMs < 2000 ? '#00ff88' : current.confirmationTimeMs < 5000 ? '#ffaa00' : '#ff4444' }}
            >
              {current.confirmationTimeMs < 2000 ? 'Fast' : current.confirmationTimeMs < 5000 ? 'Delayed' : 'Slow'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
