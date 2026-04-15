import React, { useState } from 'react';
import StatusIndicator from '../common/StatusIndicator';
import ValidatorScoreBadge from './ValidatorScoreBadge';
import { formatCompact, formatPercent, formatSol } from '../../utils/formatters';

const truncatePubkey = (pubkey) => {
  if (!pubkey) return '—';
  if (pubkey.length <= 12) return pubkey;
  return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
};

const getSkipRateColor = (skipRate) => {
  if (skipRate === null || skipRate === undefined) return 'text-text-muted';
  if (skipRate <= 0.02) return 'text-accent-green';
  if (skipRate <= 0.05) return 'text-accent-amber';
  return 'text-accent-red';
};

const getCommissionColor = (commission) => {
  if (commission === null || commission === undefined) return 'text-text-muted';
  if (commission <= 5) return 'text-accent-green';
  if (commission <= 10) return 'text-accent-amber';
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

export default function ValidatorTable({ 
  validators, 
  onSort, 
  sortField, 
  sortDirection, 
  onSelectValidator,
  selectedValidator 
}) {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (field) => {
    onSort(field);
  };

  const handleRowClick = (validator) => {
    onSelectValidator(validator);
  };

  const tableHeaders = [
    { key: 'rank', label: '#', sortable: false },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'score', label: 'Score', sortable: true },
    { key: 'stake_sol', label: 'Stake', sortable: true },
    { key: 'commission', label: 'Comm', sortable: true },
    { key: 'skip_rate', label: 'Skip', sortable: true },
    { key: 'software_version', label: 'Version', sortable: false },
    { key: 'data_center', label: 'Data Center', sortable: false },
    { key: 'is_delinquent', label: 'Status', sortable: false },
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
          {validators.map((validator, index) => {
            const isDelinquent = validator.is_delinquent;
            const isSelected = selectedValidator?.vote_pubkey === validator.vote_pubkey;
            const name = validator.name || truncatePubkey(validator.identity_pubkey);
            
            return (
              <tr
                key={validator.vote_pubkey || index}
                className={`border-b border-border-subtle transition-all duration-200 cursor-pointer ${
                  hoveredRow === index ? 'bg-white/5' : ''
                } ${isDelinquent ? 'border-l-2 border-l-accent-red bg-accent-red/5' : ''} ${
                  isSelected ? 'bg-accent-cyan/10 border-l-2 border-l-accent-cyan' : ''
                }`}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => handleRowClick(validator)}
              >
                {/* Rank */}
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-text-muted">
                    {index + 1}
                  </span>
                </td>
                
                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {validator.avatar_url && (
                      <img 
                        src={validator.avatar_url} 
                        alt="" 
                        className="w-6 h-6 rounded-full"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div>
                      <div className="font-medium text-text-primary truncate max-w-[150px]">
                        {name}
                      </div>
                      {!validator.name && (
                        <div className="text-xs text-text-dim font-mono">
                          {truncatePubkey(validator.vote_pubkey)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                {/* Score */}
                <td className="px-4 py-3">
                  <ValidatorScoreBadge score={validator.score} />
                </td>
                
                {/* Stake */}
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-text-primary">
                    {validator.stake_sol !== undefined 
                      ? `${formatCompact(validator.stake_sol)} SOL`
                      : '—'}
                  </span>
                </td>
                
                {/* Commission */}
                <td className="px-4 py-3">
                  <span className={`font-mono text-sm ${getCommissionColor(validator.commission)}`}>
                    {validator.commission !== undefined 
                      ? `${validator.commission}%`
                      : '—%'}
                  </span>
                </td>
                
                {/* Skip Rate */}
                <td className="px-4 py-3">
                  <span className={`font-mono text-sm ${getSkipRateColor(validator.skip_rate)}`}>
                    {validator.skip_rate !== undefined 
                      ? formatPercent(validator.skip_rate, 1)
                      : '—%'}
                  </span>
                </td>
                
                {/* Software Version */}
                <td className="px-4 py-3">
                  <span className="text-xs text-text-dim font-mono">
                    {validator.software_version || '—'}
                  </span>
                </td>
                
                {/* Data Center */}
                <td className="px-4 py-3">
                  <span className="text-xs text-text-dim">
                    {validator.data_center || '—'}
                  </span>
                </td>
                
                {/* Status */}
                <td className="px-4 py-3">
                  <StatusIndicator 
                    status={isDelinquent ? 'critical' : 'healthy'} 
                    size="sm" 
                    label={null}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
