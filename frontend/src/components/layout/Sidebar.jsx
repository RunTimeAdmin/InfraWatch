import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◉' },
  { path: '/validators', label: 'Validators', icon: '⬡' },
  { path: '/rpc', label: 'RPC Health', icon: '⚡' },
  { path: '/map', label: 'Data Centers', icon: '🌐' },
  { path: '/mev', label: 'MEV Tracker', icon: '◈' },
  { path: '/bags', label: 'Bags Ecosystem', icon: '◆' },
  { path: '/alerts', label: 'Alerts', icon: '▲' },
];

// Group nav items for visual separation
const mainNavItems = navItems.slice(0, 3);
const featureNavItems = navItems.slice(3);

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="h-full w-60 min-w-60 bg-bg-secondary border-r border-border-subtle flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          {/* Logo Image */}
          <img 
            src="/InfraWatch.png" 
            alt="InfraWatch" 
            className="w-12 h-12 object-contain"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.3))'
            }}
          />
          <div>
            <div className="flex items-baseline gap-0">
              <span 
                className="text-xl font-bold tracking-tight logo-infra"
                style={{ 
                  color: '#00ff88',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
                  animation: 'logo-pulse 3s ease-in-out infinite'
                }}
              >
                INFRA
              </span>
              <span className="text-xl font-bold tracking-tight text-text-primary">
                WATCH
              </span>
            </div>
            <p className="text-xs text-text-dim tracking-wide">
              Solana Infrastructure Monitor
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {/* Main Navigation */}
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-md
                    text-sm font-medium tracking-wide
                    transition-all duration-200 relative overflow-hidden
                    ${isActive 
                      ? 'text-accent-green bg-accent-green/5' 
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                    }
                  `}
                >
                  {/* Active indicator - pronounced left border */}
                  {isActive && (
                    <span 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r"
                      style={{ backgroundColor: '#00ff88', boxShadow: '0 0 8px #00ff88' }}
                    />
                  )}
                  <span className={`text-base transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
        
        {/* Separator */}
        <div className="my-4 px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
          <p className="text-xs text-text-dim mt-2 px-0 uppercase tracking-wider">Analytics</p>
        </div>
        
        {/* Feature Navigation */}
        <ul className="space-y-1">
          {featureNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-md
                    text-sm font-medium tracking-wide
                    transition-all duration-200 relative overflow-hidden
                    ${isActive 
                      ? 'text-accent-green bg-accent-green/5' 
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                    }
                  `}
                >
                  {/* Active indicator - pronounced left border */}
                  {isActive && (
                    <span 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r"
                      style={{ backgroundColor: '#00ff88', boxShadow: '0 0 8px #00ff88' }}
                    />
                  )}
                  <span className={`text-base transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <p className="text-xs text-text-dim">
            v0.1.0 — Week 1 MVP
          </p>
        </div>
      </div>
    </aside>
  );
}
