import React from 'react';
import MetricCard from '../common/MetricCard';
import useNetworkStore from '../../stores/networkStore';

export default function ConfirmationTimeCard() {
  const { current } = useNetworkStore();
  
  const confirmationTime = current?.confirmationTimeMs ?? null;
  
  const displayValue = confirmationTime !== null ? `${Math.round(confirmationTime)}ms` : '—';
  
  // Confirmation time status thresholds
  const getStatus = (ms) => {
    if (!ms && ms !== 0) return 'healthy';
    if (ms < 2000) return 'healthy';
    if (ms < 5000) return 'degraded';
    return 'critical';
  };
  
  return (
    <MetricCard
      title="Confirmation Time"
      value={displayValue}
      subtitle="1h rolling average"
      status={getStatus(confirmationTime)}
    />
  );
}
