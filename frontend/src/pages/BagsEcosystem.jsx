import React from 'react';
import { Wallet, ArrowRightLeft, Bell, Users } from '../components/common/Icons';

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
        <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent-cyan" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      </div>
      
      <p className="text-text-muted text-sm mb-4 leading-relaxed">
        {description}
      </p>
      
      <div className="space-y-2">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-text-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan/60" />
            {feature}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border-subtle">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
          Coming in Week 2
        </span>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, subtext, color = 'cyan' }) => {
  const colorClasses = {
    cyan: 'text-accent-cyan bg-accent-cyan/10',
    green: 'text-accent-green bg-accent-green/10',
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

export default function BagsEcosystem() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Bags Ecosystem</h2>
          <p className="text-text-muted text-sm mt-1">
            Whale wallet tracking and large holder movements
          </p>
        </div>
      </div>
      
      {/* Coming Soon Card */}
      <ComingSoonCard
        icon={Wallet}
        title="Whale Watch"
        description="Track large holder movements, significant token transfers, and whale wallet activity with configurable alerts and historical analysis."
        features={[
          "Top 1000 wallet tracking",
          "Large transfer alerts",
          "Accumulation/distribution signals",
          "Token flow visualization"
        ]}
      />
      
      {/* Preview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={Users}
          label="Whale Wallets Tracked"
          value="1,247"
          subtext="Wallets > $1M holdings"
          color="cyan"
        />
        <StatCard
          icon={ArrowRightLeft}
          label="24h Large Transfers"
          value="$284M"
          subtext="Transfers > $100K"
          color="green"
        />
      </div>
      
      {/* Feature Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-accent-amber" />
            <span className="text-sm font-medium text-text-primary">Smart Alerts</span>
          </div>
          <p className="text-sm text-text-muted">
            Get notified when whales move significant amounts or accumulate specific tokens
          </p>
        </div>
        
        <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft className="w-4 h-4 text-accent-green" />
            <span className="text-sm font-medium text-text-primary">Flow Analysis</span>
          </div>
          <p className="text-sm text-text-muted">
            Track token flows between exchanges, wallets, and DeFi protocols
          </p>
        </div>
        
        <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm font-medium text-text-primary">Portfolio Tracking</span>
          </div>
          <p className="text-sm text-text-muted">
            Monitor whale portfolio changes and new position openings
          </p>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent-cyan/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-accent-cyan text-sm">ℹ</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-primary">About Whale Tracking</h4>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            Whale tracking monitors large holder movements to identify market trends and significant 
            capital flows. This feature helps users understand institutional activity, detect 
            accumulation patterns, and anticipate potential market movements.
          </p>
        </div>
      </div>
    </div>
  );
}
