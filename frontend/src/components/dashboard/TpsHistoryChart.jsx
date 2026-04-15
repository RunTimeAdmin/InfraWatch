import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useNetworkStore from '../../stores/networkStore';
import { formatNumber } from '../../utils/formatters';

const RANGE_OPTIONS = [
  { value: '1h', label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' }
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-3 shadow-lg">
        <p className="text-xs text-text-muted mb-1">
          {new Date(data.timestamp).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
        <p className="text-sm font-medium text-accent-green">
          {formatNumber(Math.round(data.tps))} TPS
        </p>
      </div>
    );
  }
  return null;
};

export default function TpsHistoryChart() {
  const { history, tpsHistory, historyRange, setHistoryRange } = useNetworkStore();
  
  // Format data for chart - prefer tpsHistory (live WebSocket data), fallback to history (API data)
  const sourceData = tpsHistory?.length > 0 ? tpsHistory : (history || []);
  const chartData = sourceData.map(h => ({
    timestamp: h.timestamp,
    tps: h.tps
  }));
  
  // Format X-axis tick based on range
  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp);
    if (historyRange === '1h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    if (historyRange === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="bg-bg-card border border-border-subtle rounded-lg p-6 hover:border-border-accent transition-all duration-300">
      {/* Header with range selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
            TPS History
          </h3>
          <p className="text-xs text-text-dim mt-1">
            Transaction throughput over time
          </p>
        </div>
        
        {/* Range selector */}
        <div className="flex items-center gap-1 bg-bg-tertiary rounded-lg p-1">
          {RANGE_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setHistoryRange(option.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                historyRange === option.value
                  ? 'bg-accent-green text-bg-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-[300px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="99%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff88" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.03)" 
                vertical={false}
              />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke="#555555"
                tick={{ fill: '#555555', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.06)' }}
                minTickGap={30}
              />
              <YAxis 
                stroke="#555555"
                tick={{ fill: '#555555', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatNumber(value)}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="tps"
                stroke="#00ff88"
                strokeWidth={2}
                fill="url(#historyGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-text-dim text-sm">No data available</span>
          </div>
        )}
      </div>
    </div>
  );
}
