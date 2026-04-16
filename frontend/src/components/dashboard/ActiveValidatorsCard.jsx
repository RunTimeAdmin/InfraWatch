import React from 'react';
import { Users } from 'lucide-react';
import MetricCard from '../common/MetricCard';
import useNetworkStore from '../../stores/networkStore';
import { formatNumber } from '../../utils/formatters';

const getValidatorStatus = (count) => {
  if (count === null || count === undefined) return 'healthy';
  if (count >= 1700) return 'healthy';
  if (count >= 1500) return 'degraded';
  return 'critical';
};

export default function ActiveValidatorsCard() {
  const { current } = useNetworkStore();
  
  const activeCount = current?.activeValidators ?? null;
  
  // Baseline for comparison (typical Solana validator count)
  const baseline = 1900;
  const comparison = activeCount !== null ? activeCount - baseline : 0;
  const status = getValidatorStatus(activeCount);
  
  return (
    <MetricCard
      title="Active Validators"
      value={activeCount !== null ? formatNumber(activeCount) : '—'}
      subtitle={comparison !== 0 ? `${comparison > 0 ? '+' : ''}${formatNumber(comparison)} vs baseline` : '—'}
      status={status}
      lucideIcon={Users}
    />
  );
}
