import React from 'react';
import StatusIndicator from '../common/StatusIndicator';
import ValidatorScoreBadge from './ValidatorScoreBadge';
import { formatCompact, formatPercent, formatDateTime } from '../../utils/formatters';

const truncatePubkey = (pubkey, length = 12) => {
  if (!pubkey) return '—';
  if (pubkey.length <= length * 2) return pubkey;
  return `${pubkey.slice(0, length)}...${pubkey.slice(-length)}`;
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

export default function ValidatorDetailPanel({ validator, onClose }) {
  if (!validator) return null;

  const name = validator.name || truncatePubkey(validator.identity_pubkey, 8);
  const isDelinquent = validator.is_delinquent;

  return (
    <div className="mt-6 bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-tertiary/30">
        <div className="flex items-center gap-4">
          {validator.avatar_url && (
            <img 
              src={validator.avatar_url} 
              alt="" 
              className="w-12 h-12 rounded-full border border-border-subtle"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div>
            <h3 className="text-lg font-bold text-text-primary">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-muted font-mono">
                {truncatePubkey(validator.vote_pubkey, 10)}
              </span>
              <button
                onClick={() => copyToClipboard(validator.vote_pubkey)}
                className="text-text-muted hover:text-accent-green transition-colors"
                title="Copy vote pubkey"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Score Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Performance Score
            </h4>
            <div className="flex items-center gap-4">
              <ValidatorScoreBadge score={validator.score} />
              <div className="flex-1">
                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${validator.score || 0}%`,
                      backgroundColor: validator.score >= 90 ? '#00ff88' : validator.score >= 70 ? '#ffaa00' : '#ff4444'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stake Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Stake
            </h4>
            <div className="text-2xl font-bold font-mono text-text-primary">
              {validator.stake_sol !== undefined 
                ? `${formatCompact(validator.stake_sol)} SOL`
                : '—'}
            </div>
          </div>

          {/* Commission Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Commission
            </h4>
            <div className={`text-2xl font-bold font-mono ${
              validator.commission <= 5 ? 'text-accent-green' : 
              validator.commission <= 10 ? 'text-accent-amber' : 'text-accent-red'
            }`}>
              {validator.commission !== undefined ? `${validator.commission}%` : '—%'}
            </div>
          </div>

          {/* Skip Rate Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Skip Rate
            </h4>
            <div className={`text-2xl font-bold font-mono ${
              validator.skip_rate <= 0.02 ? 'text-accent-green' : 
              validator.skip_rate <= 0.05 ? 'text-accent-amber' : 'text-accent-red'
            }`}>
              {validator.skip_rate !== undefined 
                ? formatPercent(validator.skip_rate, 2)
                : '—%'}
            </div>
          </div>

          {/* Software Version Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Software Version
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono text-text-primary">
                {validator.software_version || '—'}
              </span>
              {validator.software_version && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent-green/10 text-accent-green border border-accent-green/30">
                  Up to date
                </span>
              )}
            </div>
          </div>

          {/* Data Center Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Data Center
            </h4>
            <div className="text-lg text-text-primary">
              {validator.data_center || '—'}
            </div>
            {validator.asn && (
              <div className="text-sm text-text-muted font-mono">
                ASN: {validator.asn}
              </div>
            )}
          </div>

          {/* Jito Status */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Jito MEV
            </h4>
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  validator.jito_enabled ? 'bg-accent-green' : 'bg-text-muted'
                }`}
              />
              <span className="text-lg text-text-primary">
                {validator.jito_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Delinquency Status */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Status
            </h4>
            <div className="flex items-center gap-3">
              <StatusIndicator 
                status={isDelinquent ? 'critical' : 'healthy'} 
                size="md"
                label={isDelinquent ? 'Delinquent' : 'Active'}
              />
            </div>
          </div>
        </div>

        {/* Identity Pubkey */}
        <div className="mt-6 pt-6 border-t border-border-subtle">
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
            Identity Pubkey
          </h4>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono text-text-dim bg-bg-tertiary px-3 py-2 rounded">
              {validator.identity_pubkey || '—'}
            </code>
            {validator.identity_pubkey && (
              <button
                onClick={() => copyToClipboard(validator.identity_pubkey)}
                className="p-2 text-text-muted hover:text-accent-green transition-colors"
                title="Copy identity pubkey"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
