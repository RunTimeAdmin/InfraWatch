import React from 'react';
import { AlertTriangle } from 'lucide-react';
import MetricCard from '../common/MetricCard';
import useNetworkStore from '../../stores/networkStore';
import { formatNumber } from '../../utils/formatters';

export default function DelinquentValidatorsCard() {
  const { current } = useNetworkStore();
  
  const delinquentCount = current?.delinquentCount ?? null;
  const activeCount = current?.activeValidators ?? null;
  
  const hasDelinquents = delinquentCount > 0;
  const status = hasDelinquents ? 'critical' : 'healthy';
  
  return (
    <MetricCard
      title="Delinquent Validators"
      value={delinquentCount !== null ? formatNumber(delinquentCount) : '—'}
      subtitle={activeCount !== null ? `of ${formatNumber(activeCount)} total` : '—'}
      status={status}
      lucideIcon={AlertTriangle}
    >
      {hasDelinquents && (
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
          <span className="text-xs text-accent-red">
            Attention required
          </span>
        </div>
      )}
      {!hasDelinquents && delinquentCount !== null && (
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-green" />
          <span className="text-xs text-accent-green">
            All validators healthy
          </span>
        </div>
      )}
    </MetricCard>
  );
}
