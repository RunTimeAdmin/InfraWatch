import React from 'react';
import MetricCard from '../common/MetricCard';
import useNetworkStore from '../../stores/networkStore';

const getLatencyStatus = (latency) => {
  if (!latency && latency !== 0) return 'healthy';
  if (latency < 500) return 'healthy';
  if (latency < 800) return 'degraded';
  return 'critical';
};

export default function SlotLatencyCard() {
  const { current } = useNetworkStore();
  
  const latency = current?.slotLatencyMs ?? null;
  const status = getLatencyStatus(latency);
  
  const displayValue = latency !== null ? `${Math.round(latency)}ms` : '—';
  
  return (
    <MetricCard
      title="Slot Latency"
      value={displayValue}
      subtitle="target: 400ms"
      status={status}
    />
  );
}
