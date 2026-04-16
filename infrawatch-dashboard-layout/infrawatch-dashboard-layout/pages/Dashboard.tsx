import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

/**
 * Dashboard - Main monitoring dashboard
 * Displays key network metrics and real-time data
 */

export default function Dashboard() {
  const metrics = [
    { label: 'TPS', value: '4,250', trend: '+12%', status: 'healthy', icon: BarChart3 },
    { label: 'Slot Latency', value: '450ms', trend: '-5%', status: 'healthy', icon: Activity },
    { label: 'Confirmation Time', value: '8.2s', trend: '+2%', status: 'degraded', icon: Zap },
    { label: 'Validators', value: '3,421', trend: '+1', status: 'healthy', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Network Overview</h2>
        <p className="text-text-muted">Real-time Solana infrastructure metrics and health status</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const statusColor = metric.status === 'healthy' ? 'text-neon-green' : 'text-neon-amber';
          
          return (
            <Card key={metric.label} className="metric-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-medium">{metric.label}</p>
                </div>
                <Icon className={`w-5 h-5 ${statusColor}`} />
              </div>
              <div className="mb-3">
                <p className="text-3xl font-bold text-text-primary">{metric.value}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${statusColor}`}>{metric.trend}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${metric.status === 'healthy' ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-amber/10 text-neon-amber'}`}>
                  {metric.status === 'healthy' ? 'Healthy' : 'Degraded'}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Placeholder for charts */}
      <Card className="metric-card p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-muted">TPS History Chart</p>
          <p className="text-text-dim text-sm">Real-time transaction throughput visualization</p>
        </div>
      </Card>
    </div>
  );
}
