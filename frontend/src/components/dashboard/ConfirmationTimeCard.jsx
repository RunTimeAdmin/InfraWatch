import React from 'react';
import { Zap } from 'lucide-react';
import MetricCard from '../common/MetricCard';
import useNetworkStore from '../../stores/networkStore';

export default function ConfirmationTimeCard() {
  const { current } = useNetworkStore();
  
  const confirmationTime = current?.confirmationTimeMs ?? null;
  
  const displayValue = confirmationTime !== null ? `${Math.round(confirmationTime)}ms` : '—';
  
  // Confirmation time status thresholds
  const getStatus = (ms) => {
    if (!ms && ms !== 0) return 'healthy';
    if (ms < 15000) return 'healthy';      // < 15s: normal finalized confirmation
    if (ms < 20000) return 'degraded';     // 15-20s: slightly elevated
    return 'critical';                      // > 20s: network significantly lagging
  };
  
  return (
    <MetricCard
      title="Finalization Time"
      value={displayValue}
      subtitle="1h rolling average"
      status={getStatus(confirmationTime)}
      lucideIcon={Zap}
    />
  );
}
