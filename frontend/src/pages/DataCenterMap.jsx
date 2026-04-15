import React from 'react';
import { MapPin, Server, Globe } from '../components/common/Icons';

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

export default function DataCenterMap() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Global Data Center Map</h2>
          <p className="text-text-muted text-sm mt-1">
            Geographic distribution and infrastructure analysis
          </p>
        </div>
      </div>
      
      {/* Coming Soon Card */}
      <ComingSoonCard
        icon={Globe}
        title="Interactive World Map"
        description="Visualize Solana's global infrastructure with real-time validator geolocation, data center clustering, and network topology analysis."
        features={[
          "Validator geolocation heatmap",
          "Data center concentration zones",
          "Network latency by region",
          "Decentralization scoring"
        ]}
      />
      
      {/* Preview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-accent-green" />
            <span className="text-xs text-text-muted uppercase tracking-wider">Top Region</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">North America</p>
          <p className="text-sm text-accent-green mt-1">42% of total stake</p>
        </div>
        
        <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-accent-cyan" />
            <span className="text-xs text-text-muted uppercase tracking-wider">Data Centers</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">23</p>
          <p className="text-sm text-text-dim mt-1">Active locations</p>
        </div>
        
        <div className="bg-bg-card border border-border-subtle rounded-lg p-4 hover:border-border-accent transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-accent-amber" />
            <span className="text-xs text-text-muted uppercase tracking-wider">Decentralization</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">Good</p>
          <p className="text-sm text-accent-green mt-1">Nakamoto: 0.87</p>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-accent-green text-sm">ℹ</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-primary">About This Feature</h4>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            The Data Center Map will provide comprehensive geographic visualization of Solana's infrastructure, 
            helping identify concentration risks and network resilience. Interactive features will include 
            validator clustering, ISP analysis, and real-time health by region.
          </p>
        </div>
      </div>
    </div>
  );
}
