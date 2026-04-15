import React from 'react';
import MetricCard from '../common/MetricCard';
import useNetworkStore from '../../stores/networkStore';
import { formatNumber } from '../../utils/formatters';

export default function ActiveValidatorsCard() {
  const { current } = useNetworkStore();
  
  const activeCount = current?.activeValidators ?? null;
  
  // Baseline for comparison (typical Solana validator count)
  const baseline = 1400;
  const comparison = activeCount !== null ? activeCount - baseline : 0;
  
  return (
    <MetricCard
      title="Active Validators"
      value={activeCount !== null ? formatNumber(activeCount) : '—'}
      subtitle={comparison !== 0 ? `${comparison > 0 ? '+' : ''}${formatNumber(comparison)} vs baseline` : '—'}
      status="healthy"
    />
  );
}
