import React, { useState } from 'react';
import StatusIndicator from '../common/StatusIndicator';
import { formatLatency, formatNumber } from '../../utils/formatters';

const providerCategories = {
  'Helius': 'Premium',
  'QuickNode': 'Premium',
  'Alchemy': 'Premium',
  'Ankr': 'Public',
  'GetBlock': 'Public',
  'Chainstack': 'Public',
  'BlockDaemon': 'Premium',
  'Triton': 'Premium'
};

const getLatencyColor = (ms) => {
  if (ms === null || ms === undefined) return 'text-text-muted';
  if (ms < 100) return 'text-accent-green';
  if (ms <= 300) return 'text-accent-amber';
  return 'text-accent-red';
};

const getUptimeColor = (uptime) => {
  if (uptime === null || uptime === undefined) return 'text-text-muted';
  if (uptime >= 99) return 'text-accent-green';
  if (uptime >= 95) return 'text-accent-amber';
  return 'text-accent-red';
};

const SortIcon = ({ direction, active }) => {
  if (!active) return <span className="text-text-dim opacity-30">↕</span>;
  return (
    <span className="text-accent-green">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  );
};

export default function RpcProviderTable({ providers, onSort, sortField, sortDirection }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (field) => {
    onSort(field);
  };

  const formatLastIncident = (incident) => {
    if (!incident || incident === 'Never') return 'Never';
    if (typeof incident === 'string') return incident;
    return '—';
  };

  const tableHeaders = [
    { key: 'isHealthy', label: 'Status', sortable: false },
    { key: 'providerName', label: 'Provider', sortable: true },
    { key: 'latencyMs', label: 'Latency', sortable: true },
    { key: 'stats', label: 'P50/P95/P99', sortable: false },
    { key: 'uptime', label: 'Uptime %', sortable: true },
    { key: 'lastIncident', label: 'Last Incident', sortable: false },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle bg-bg-secondary/50">
            {tableHeaders.map((header) => (
              <th
                key={header.key}
                className={`px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap ${
                  header.sortable ? 'cursor-pointer hover:text-text-primary select-none' : ''
                }`}
                onClick={() => header.sortable && handleSort(header.key)}
              >
                <div className="flex items-center gap-2">
                  {header.label}
                  {header.sortable && (
                    <SortIcon 
                      active={sortField === header.key} 
                      direction={sortDirection} 
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {providers.map((provider, index) => {
            const isHealthy = provider.isHealthy;
            const stats = provider.stats || {};
            const category = providerCategories[provider.providerName] || 'Public';
            
            return (
              <tr
                key={provider.providerName || index}
                className={`border-b border-border-subtle transition-all duration-200 ${
                  hoveredRow === index ? 'bg-white/5' : ''
                } ${!isHealthy ? 'border-l-2 border-l-accent-red' : ''}`}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Status */}
                <td className="px-4 py-3">
                  <StatusIndicator 
                    status={isHealthy ? 'healthy' : 'critical'} 
                    size="sm" 
                    label={null}
                  />
                </td>
                
                {/* Provider Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-text-primary">
                      {provider.providerName}
                    </span>
                    <span 
                      className="px-2 py-0.5 text-[10px] font-medium rounded-full border"
                      style={{
                        backgroundColor: category === 'Premium' 
                          ? 'rgba(0, 212, 255, 0.1)' 
                          : 'rgba(136, 136, 136, 0.1)',
                        borderColor: category === 'Premium'
                          ? 'rgba(0, 212, 255, 0.3)'
                          : 'rgba(136, 136, 136, 0.3)',
                        color: category === 'Premium' ? '#00d4ff' : '#888888'
                      }}
                    >
                      {category}
                    </span>
                  </div>
                </td>
                
                {/* Current Latency */}
                <td className="px-4 py-3">
                  <span className={`font-mono font-medium ${getLatencyColor(provider.latencyMs)}`}>
                    {provider.latencyMs !== null && provider.latencyMs !== undefined
                      ? formatLatency(provider.latencyMs)
                      : '—'}
                  </span>
                </td>
                
                {/* P50/P95/P99 */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                    <span>{stats.p50 !== undefined ? formatLatency(stats.p50) : '—'}</span>
                    <span>/</span>
                    <span>{stats.p95 !== undefined ? formatLatency(stats.p95) : '—'}</span>
                    <span>/</span>
                    <span>{stats.p99 !== undefined ? formatLatency(stats.p99) : '—'}</span>
                  </div>
                </td>
                
                {/* Uptime % */}
                <td className="px-4 py-3">
                  <span className={`font-mono font-medium ${getUptimeColor(stats.uptimePercent)}`}>
                    {stats.uptimePercent !== undefined 
                      ? `${formatNumber(stats.uptimePercent, 1)}%`
                      : '—%'}
                  </span>
                </td>
                
                {/* Last Incident */}
                <td className="px-4 py-3">
                  <span className="text-sm text-text-muted">
                    {formatLastIncident(stats.lastIncident)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
