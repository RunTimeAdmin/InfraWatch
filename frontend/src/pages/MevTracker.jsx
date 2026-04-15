import React from 'react';
import { Zap, TrendingUp, Target, Coins } from '../components/common/Icons';

const ComingSoonCard = ({ icon: Icon, title, description, features }) => (
  <div className="bg-bg-card border border-border-subtle rounded-lg p-6 hover:border-border-accent transition-all duration-300 relative overflow-hidden group">
    {/* Animated border effect */}
    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1), transparent)',
          animation: 'shimmer 2s infinite'
        }}
      />
    </div>
    
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent-green" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      </div>
      
      <p className="text-text-muted text-sm mb-4 leading-relaxed">
        {description}
      </p>
      
      <div className="space-y-2">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-text-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green/60" />
            {feature}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border-subtle">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 text-accent-green text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          Coming in Week 2
        </span>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, subtext, color = 'green' }) => {
  const colorClasses = {
    green: 'text-accent-green bg-accent-green/10',
    cyan: 'text-accent-cyan bg-accent-cyan/10',
    amber: 'text-accent-amber bg-accent-amber/10',
    primary: 'text-text-primary bg-white/5'
  };
  
  return (
    <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color].split(' ')[1]}`}>
          <Icon className={`w-4 h-4 ${colorClasses[color].split(' ')[0]}`} />
        </div>
        <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]}`}>{value}</p>
      <p className="text-sm text-text-dim mt-1">{subtext}</p>
    </div>
  );
};

export default function MevTracker() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">MEV Activity Tracker</h2>
          <p className="text-text-muted text-sm mt-1">
            Real-time monitoring of MEV extraction and Jito bundles
          </p>
        </div>
      </div>
      
      {/* Coming Soon Card */}
      <ComingSoonCard
        icon={Zap}
        title="Live MEV Stream"
        description="Monitor maximal extractable value in real-time with Jito bundle tracking, arbitrage detection, and sandwich attack alerts."
        features={[
          "Real-time bundle monitoring",
          "Arbitrage opportunity detection",
          "Priority fee analytics",
          "MEV profit estimation"
        ]}
      />
      
      {/* Preview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Coins}
          label="24h MEV Extracted"
          value="1,247 SOL"
          subtext="~$187K USD"
          color="green"
        />
        <StatCard
          icon={Zap}
          label="Bundles Landed"
          value="8,432"
          subtext="Last 24 hours"
          color="cyan"
        />
        <StatCard
          icon={Target}
          label="Success Rate"
          value="94.2%"
          subtext="Bundle landing rate"
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Tip"
          value="0.003 SOL"
          subtext="Per bundle"
          color="primary"
        />
      </div>
      
      {/* Info Banner */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-accent-green text-sm">ℹ</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-primary">About MEV Tracking</h4>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            MEV (Maximal Extractable Value) tracking monitors the value extracted by validators and searchers 
            through transaction ordering. This feature will provide insights into Jito bundle performance, 
            arbitrage opportunities, and network fairness metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
