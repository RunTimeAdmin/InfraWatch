import React from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, Settings, Filter } from '../components/common/Icons';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusIndicator from '../components/common/StatusIndicator';

const mockAlerts = [
  {
    id: 1,
    severity: 'critical',
    title: 'High RPC Latency',
    description: 'Multiple RPC endpoints reporting latency > 500ms',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'active',
    category: 'Infrastructure'
  },
  {
    id: 2,
    severity: 'warning',
    title: 'Validator Delinquency Spike',
    description: '15 validators marked delinquent in last hour',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'active',
    category: 'Network'
  },
  {
    id: 3,
    severity: 'info',
    title: 'Epoch Transition',
    description: 'Epoch 742 transition beginning in ~2 hours',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'active',
    category: 'Network'
  },
  {
    id: 4,
    severity: 'warning',
    title: 'MEV Bundle Failure Rate',
    description: 'Bundle failure rate above 10% threshold',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'resolved',
    category: 'MEV'
  }
];

const StatCard = ({ icon: Icon, label, value, color, subtext }) => {
  const colorClasses = {
    red: 'text-accent-red bg-accent-red/10',
    amber: 'text-accent-amber bg-accent-amber/10',
    green: 'text-accent-green bg-accent-green/10',
    primary: 'text-text-primary bg-white/5'
  };
  
  return (
    <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300 group">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color].split(' ')[1]}`}>
          <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[0]}`} />
        </div>
        <span className="text-2xl font-bold text-text-primary">{value}</span>
      </div>
      <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
      {subtext && <p className="text-xs text-text-dim mt-1">{subtext}</p>}
    </div>
  );
};

export default function Alerts() {
  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp)) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-accent-red" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-accent-amber" />;
      case 'info': return <Info className="w-4 h-4 text-accent-cyan" />;
      default: return <Bell className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Active Alerts</h2>
          <p className="text-text-muted text-sm mt-1">
            Monitor and manage infrastructure alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-accent transition-all text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-accent transition-all text-sm">
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>
      </div>
      
      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Bell}
          label="Active Alerts"
          value="3"
          color="primary"
          subtext="Requiring attention"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical"
          value="1"
          color="red"
          subtext="Immediate action needed"
        />
        <StatCard
          icon={AlertCircle}
          label="Warnings"
          value="1"
          color="amber"
          subtext="Monitor closely"
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved (24h)"
          value="12"
          color="green"
          subtext="Auto-resolved"
        />
      </div>

      {/* Alerts List */}
      <div className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
            Recent Alerts
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-dim">Sort by:</span>
            <select className="bg-bg-tertiary border border-border-subtle rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent-green">
              <option>Newest First</option>
              <option>Severity</option>
              <option>Status</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-border-subtle">
          {mockAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 hover:bg-white/5 transition-all duration-200 group ${
                alert.status === 'resolved' ? 'opacity-60' : ''
              } ${alert.severity === 'critical' && alert.status === 'active' ? 'bg-accent-red/5' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-text-primary font-medium">{alert.title}</h4>
                      <SeverityBadge severity={alert.severity} />
                      <span className="text-xs text-text-dim px-2 py-0.5 rounded bg-bg-tertiary">
                        {alert.category}
                      </span>
                    </div>
                    <p className="text-text-muted text-sm mt-1">{alert.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-text-dim font-mono">{formatTimeAgo(alert.timestamp)}</span>
                  <StatusIndicator 
                    status={alert.status === 'active' ? 'critical' : 'healthy'} 
                    label={alert.status === 'active' ? 'ACTIVE' : 'RESOLVED'}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Alert Configuration Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-accent-green" />
            <span className="text-sm font-medium text-text-primary">Smart Notifications</span>
          </div>
          <p className="text-sm text-text-muted">
            Configure alert thresholds and notification channels for your team
          </p>
        </div>
        
        <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm font-medium text-text-primary">Custom Rules</span>
          </div>
          <p className="text-sm text-text-muted">
            Create custom alert rules based on your infrastructure requirements
          </p>
        </div>
        
        <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-accent-amber" />
            <span className="text-sm font-medium text-text-primary">Auto-Resolution</span>
          </div>
          <p className="text-sm text-text-muted">
            Set up automatic alert resolution when metrics return to normal
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-accent-green text-sm">ℹ</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-primary">Coming in Week 2</h4>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            Real-time alerting with configurable thresholds, webhook integrations, 
            PagerDuty/Opsgenie support, and team notification routing.
          </p>
        </div>
      </div>
    </div>
  );
}
