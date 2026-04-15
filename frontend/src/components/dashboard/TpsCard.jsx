import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import MetricCard from '../common/MetricCard';
import useNetworkStore from '../../stores/networkStore';
import { formatNumber } from '../../utils/formatters';

const getTpsStatus = (tps) => {
  if (!tps && tps !== 0) return 'healthy';
  if (tps >= 2000) return 'healthy';
  if (tps >= 1000) return 'degraded';
  return 'critical';
};

export default function TpsCard() {
  const { current, tpsHistory } = useNetworkStore();
  
  const tps = current?.tps ?? null;
  const status = getTpsStatus(tps);
  
  // Use accumulated TPS history from WebSocket updates
  const displayData = tpsHistory.length > 0 ? tpsHistory : 
    Array(10).fill(null).map(() => ({ tps: tps || 0 }));
  
  return (
    <MetricCard
      title="Network TPS"
      value={tps !== null ? formatNumber(Math.round(tps)) : '—'}
      subtitle="Transactions per second"
      status={status}
    >
      <div className="h-16 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="tps"
              stroke="#00ff88"
              strokeWidth={2}
              fill="url(#tpsGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </MetricCard>
  );
}
