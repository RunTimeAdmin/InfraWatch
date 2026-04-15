import React, { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import RpcRecommendationBanner from '../components/rpc/RpcRecommendationBanner';
import RpcProviderTable from '../components/rpc/RpcProviderTable';
import useRpcStore from '../stores/rpcStore';
import { fetchRpcStatus } from '../services/rpcApi';

export default function RpcHealth() {
  const { 
    providers, 
    recommendation, 
    loading, 
    error, 
    setProviders, 
    setRecommendation, 
    setLoading, 
    setError 
  } = useRpcStore();
  
  const [sortField, setSortField] = useState('latencyMs');
  const [sortDirection, setSortDirection] = useState('asc');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRpcStatus();
      // Merge API data with any existing providers (from WebSocket)
      if (data.providers && data.providers.length > 0) {
        setProviders(data.providers);
      }
      if (data.recommendation) {
        setRecommendation(data.recommendation);
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch RPC status');
    }
  }, [setProviders, setRecommendation, setLoading, setError]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // WebSocket connection for real-time RPC updates
  useEffect(() => {
    const socket = io('/', { path: '/socket.io', transports: ['websocket', 'polling'] });
    
    socket.on('connect', () => {
      console.log('[RpcHealth] WebSocket connected');
    });
    
    socket.on('rpc:update', (rpcData) => {
      console.log('[RpcHealth] Received rpc:update', rpcData);
      if (Array.isArray(rpcData)) {
        // rpcData is an array of provider results from the prober
        // Enhance with stats from the prober
        const enhancedProviders = rpcData.map(provider => ({
          providerName: provider.providerName,
          endpoint: provider.endpoint,
          latencyMs: provider.latencyMs,
          isHealthy: provider.isHealthy,
          slotHeight: provider.slotHeight,
          timestamp: provider.timestamp,
          stats: {
            p50: provider.latencyMs,
            p95: provider.latencyMs,
            p99: provider.latencyMs,
            uptimePercent: provider.isHealthy ? 100 : 0,
          }
        }));
        setProviders(enhancedProviders);
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [setProviders]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProviders = React.useMemo(() => {
    if (!providers.length) return [];
    
    return [...providers].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case 'latencyMs':
          aVal = a.latencyMs ?? Infinity;
          bVal = b.latencyMs ?? Infinity;
          break;
        case 'providerName':
          aVal = a.providerName?.toLowerCase() ?? '';
          bVal = b.providerName?.toLowerCase() ?? '';
          break;
        case 'uptime':
          aVal = a.stats?.uptimePercent ?? 0;
          bVal = b.stats?.uptimePercent ?? 0;
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [providers, sortField, sortDirection]);

  if (loading && !providers.length) {
    return (
      <div className="space-y-6">
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
          <LoadingSkeleton variant="card" height="80px" />
        </div>
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
          <LoadingSkeleton variant="text" height="40px" />
          <div className="mt-4 space-y-3">
            <LoadingSkeleton variant="text" height="50px" />
            <LoadingSkeleton variant="text" height="50px" />
            <LoadingSkeleton variant="text" height="50px" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-bg-card border border-accent-red/30 rounded-lg p-8 text-center">
          <div className="text-accent-red text-lg font-semibold mb-2">
            Error Loading RPC Data
          </div>
          <p className="text-text-muted mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded hover:bg-accent-green/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            RPC HEALTH
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Monitor RPC endpoint health, response times, and availability
          </p>
        </div>
        <div className="text-xs text-text-muted">
          {providers.length} providers monitored
        </div>
      </div>

      {/* Recommendation Banner */}
      <RpcRecommendationBanner recommendation={recommendation} />

      {/* Provider Table */}
      <div className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
            Provider Status
          </h2>
        </div>
        <RpcProviderTable
          providers={sortedProviders}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </div>
    </div>
  );
}
