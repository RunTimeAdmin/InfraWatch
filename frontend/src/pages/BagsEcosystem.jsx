import React, { useEffect, useCallback } from 'react';
import useBagsStore from '../stores/bagsStore';
import useNetworkStore from '../stores/networkStore';
import { fetchBagsPools, fetchBagsLaunches } from '../services/bagsApi';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { Wallet, ArrowRightLeft, Activity, CheckCircle, Server, Zap, Coins, Info } from '../components/common/Icons';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subtext, color = 'cyan', isLoading = false }) => {
  const colorClasses = {
    cyan: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
    green: 'text-accent-green bg-accent-green/10 border-accent-green/20',
    amber: 'text-accent-amber bg-accent-amber/10 border-accent-amber/20',
    red: 'text-accent-red bg-accent-red/10 border-accent-red/20',
  };

  return (
    <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color].split(' ')[1]}`}>
          <Icon className={`w-4 h-4 ${colorClasses[color].split(' ')[0]}`} />
        </div>
        <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      {isLoading ? (
        <LoadingSkeleton variant="text" height="28px" width="60px" />
      ) : (
        <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]}`}>{value}</p>
      )}
      <p className="text-sm text-text-dim mt-1">{subtext}</p>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    PRE_LAUNCH: { color: 'amber', label: 'PRE-LAUNCH' },
    LAUNCHED: { color: 'green', label: 'LAUNCHED' },
  };

  const config = statusConfig[status] || { color: 'gray', label: status || 'UNKNOWN' };
  
  const colorClasses = {
    amber: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    green: 'bg-accent-green/10 text-accent-green border-accent-green/20',
    gray: 'bg-white/5 text-text-muted border-white/10',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClasses[config.color]}`}>
      {config.label}
    </span>
  );
};

// Truncate text helper
const truncateMint = (mint) => {
  if (!mint || mint.length < 12) return mint || '-';
  return `${mint.slice(0, 8)}...${mint.slice(-4)}`;
};

export default function BagsEcosystem() {
  const {
    pools,
    launches,
    poolCount,
    launchCount,
    isLoading,
    error,
    lastUpdate,
    setPools,
    setLaunches,
    setLoading,
    setError,
    setLastUpdate,
  } = useBagsStore();

  const { current: networkCurrent } = useNetworkStore();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [poolsResponse, launchesResponse] = await Promise.all([
        fetchBagsPools(),
        fetchBagsLaunches(),
      ]);

      // Handle pools response - data is in .data property
      if (poolsResponse?.success && Array.isArray(poolsResponse.data)) {
        setPools(poolsResponse.data);
      } else if (Array.isArray(poolsResponse)) {
        setPools(poolsResponse);
      } else {
        setPools([]);
      }

      // Handle launches response - data is in .data property
      if (launchesResponse?.success && Array.isArray(launchesResponse.data)) {
        setLaunches(launchesResponse.data);
      } else if (Array.isArray(launchesResponse)) {
        setLaunches(launchesResponse);
      } else {
        setLaunches([]);
      }

      setLastUpdate();
    } catch (err) {
      console.error('[BagsEcosystem] Error loading data:', err);
      setError(err.message || 'Failed to fetch Bags data');
      setPools([]);
      setLaunches([]);
    } finally {
      setLoading(false);
    }
  }, [setPools, setLaunches, setLoading, setError, setLastUpdate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Determine API status
  const hasApiKey = !error && (pools.length > 0 || launches.length > 0 || (!isLoading && !error));
  const apiStatusText = error?.includes('not configured') || (pools.length === 0 && launches.length === 0 && !isLoading)
    ? 'NO API KEY'
    : 'BAGS API CONNECTED';
  const apiStatusColor = apiStatusText === 'BAGS API CONNECTED' ? 'green' : 'amber';

  // Get TPS and congestion from network store
  const currentTps = networkCurrent?.tps ?? '-';
  const congestionScore = networkCurrent?.congestionScore ?? '-';

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            BAGS ECOSYSTEM
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Bags platform activity correlated with Solana infrastructure health
          </p>
        </div>
        {lastUpdate && (
          <div className="text-xs text-text-dim">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Coins}
          label="Active Pools"
          value={isLoading ? '-' : poolCount}
          subtext="Bags liquidity pools"
          color="cyan"
          isLoading={isLoading}
        />
        <StatCard
          icon={Zap}
          label="Recent Launches"
          value={isLoading ? '-' : launchCount}
          subtext="Token launch feed"
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          icon={Server}
          label="Platform Status"
          value={isLoading ? '-' : apiStatusText}
          subtext={apiStatusText === 'BAGS API CONNECTED' ? 'Real-time data active' : 'Configure BAGS_API_KEY'}
          color={apiStatusColor}
          isLoading={isLoading}
        />
      </div>

      {/* Network Correlation Panel */}
      <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-accent-cyan" />
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
            Infrastructure x Ecosystem Correlation
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-xs text-text-dim uppercase tracking-wider">Current Network TPS</div>
            <div className="text-3xl font-bold text-accent-green">
              {typeof currentTps === 'number' ? currentTps.toLocaleString() : currentTps}
            </div>
            <div className="text-xs text-text-muted">Transactions per second</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs text-text-dim uppercase tracking-wider">Congestion Score</div>
            <div className={`text-3xl font-bold ${
              typeof congestionScore === 'number' 
                ? congestionScore > 70 ? 'text-accent-red' : congestionScore > 40 ? 'text-accent-amber' : 'text-accent-green'
                : 'text-text-muted'
            }`}>
              {typeof congestionScore === 'number' ? `${congestionScore}/100` : congestionScore}
            </div>
            <div className="text-xs text-text-muted">Network congestion level</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs text-text-dim uppercase tracking-wider">Active Bags Pools</div>
            <div className="text-3xl font-bold text-accent-cyan">
              {isLoading ? '-' : poolCount}
            </div>
            <div className="text-xs text-text-muted">Liquidity pools tracked</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border-subtle">
          <p className="text-sm text-text-muted">
            <span className="text-accent-cyan">→</span>{' '}
            When network TPS drops below 1,500, Bags transactions may experience delays. 
            High congestion scores (&gt;70) indicate potential impacts on token launch participation and trading activity.
          </p>
        </div>
      </div>

      {/* Recent Token Launches Table */}
      <div className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-amber" />
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
              Recent Token Launches
            </h2>
          </div>
          <span className="text-xs text-text-dim">{launches.length} tokens</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-6 py-3 text-left text-xs font-medium text-text-dim uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-dim uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-dim uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-dim uppercase tracking-wider">Token Mint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4">
                    <LoadingSkeleton variant="text" height="40px" />
                  </td>
                </tr>
              ) : launches.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="text-text-muted text-sm">
                      No launch data available — configure BAGS_API_KEY
                    </div>
                  </td>
                </tr>
              ) : (
                launches.slice(0, 10).map((launch, idx) => (
                  <tr key={launch.tokenMint || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3 text-sm text-text-primary font-medium">
                      {launch.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-3 text-sm text-accent-cyan">
                      {launch.symbol || '-'}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={launch.status} />
                    </td>
                    <td className="px-6 py-3 text-sm text-text-dim font-mono">
                      {truncateMint(launch.tokenMint)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Pools Table */}
      <div className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-accent-cyan" />
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
              Active Pools
            </h2>
          </div>
          <span className="text-xs text-text-dim">{pools.length} pools</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-6 py-3 text-left text-xs font-medium text-text-dim uppercase tracking-wider">Token Mint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-dim uppercase tracking-wider">Pool Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-dim uppercase tracking-wider">DAMM v2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4">
                    <LoadingSkeleton variant="text" height="40px" />
                  </td>
                </tr>
              ) : pools.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center">
                    <div className="text-text-muted text-sm">
                      No pool data available — configure BAGS_API_KEY
                    </div>
                  </td>
                </tr>
              ) : (
                pools.slice(0, 10).map((pool, idx) => (
                  <tr key={pool.dbcPoolKey || pool.tokenMint || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3 text-sm text-text-dim font-mono">
                      {truncateMint(pool.tokenMint)}
                    </td>
                    <td className="px-6 py-3 text-sm text-text-dim font-mono">
                      {truncateMint(pool.dbcPoolKey)}
                    </td>
                    <td className="px-6 py-3">
                      {pool.dammV2PoolKey ? (
                        <CheckCircle className="w-4 h-4 text-accent-green" />
                      ) : (
                        <span className="text-text-dim">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent-cyan/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-accent-cyan" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-primary">Bags Ecosystem Correlation</h4>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            The Bags platform enables token launches and liquidity pools on Solana. Monitoring 
            Bags ecosystem activity alongside network infrastructure metrics helps identify 
            correlations between network health and DeFi participation. High congestion or low 
            TPS can impact token launch success rates, trading volumes, and user experience 
            across the Bags ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}
