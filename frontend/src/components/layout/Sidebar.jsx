import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Users, Zap, Map, TrendingUp, Package, Bell } from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const navItems = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/validators', label: 'Validators', icon: Users },
  { path: '/rpc', label: 'RPC Health', icon: Zap },
  { path: '/map', label: 'Data Centers', icon: Map },
  { path: '/mev', label: 'MEV Tracker', icon: TrendingUp },
  { path: '/bags', label: 'Bags Ecosystem', icon: Package },
  { path: '/alerts', label: 'Alerts', icon: Bell },
];

// Group nav items for visual separation
const mainNavItems = navItems.slice(0, 3);
const featureNavItems = navItems.slice(3);

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="h-full bg-bg-secondary border-r border-border-subtle flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          {/* Gradient Logo Icon */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-green to-accent-cyan flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-bg-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-0">
              <span 
                className="text-xl font-bold tracking-tight logo-infra animate-glow-pulse"
                style={{ 
                  color: '#00ff88',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.4)'
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
                      ? 'text-accent-green bg-accent-green/10' 
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
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
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
                      ? 'text-accent-green bg-accent-green/10' 
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
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className="relative z-10">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-subtle space-y-3">
        {/* Social Links */}
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://github.com/RunTimeAdmin/InfraWatch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-dim hover:text-accent-green transition-colors duration-200"
            title="GitHub Repository"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
          <a
            href="https://x.com/DeFiAuditCCIE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-dim hover:text-accent-green transition-colors duration-200"
            title="@DeFiAuditCCIE on X"
          >
            <XIcon className="w-4 h-4" />
          </a>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <p className="text-xs text-text-dim">
            v0.2.0 — Enhanced
          </p>
        </div>
      </div>
    </aside>
  );
}
