import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Zap, 
  Map, 
  TrendingUp, 
  Package, 
  Bell,
  Github,
  Twitter
} from 'lucide-react';

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
      {/* Logo Section */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-green to-accent-cyan flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-bg-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight text-accent-green animate-glow-pulse">
                INFRA
              </span>
              <span className="text-lg font-bold tracking-tight text-text-primary">
                WATCH
              </span>
            </div>
            <p className="text-xs text-text-muted tracking-wide">
              Solana Monitor
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
            const Icon = item.icon;
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
                  {/* Active indicator */}
                  {isActive && (
                    <span 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r"
                      style={{ backgroundColor: '#00ff88', boxShadow: '0 0 8px #00ff88' }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
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
            const Icon = item.icon;
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
                  {/* Active indicator */}
                  {isActive && (
                    <span 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r"
                      style={{ backgroundColor: '#00ff88', boxShadow: '0 0 8px #00ff88' }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
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
            className="text-text-muted hover:text-accent-green transition-colors duration-200"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="https://x.com/DeFiAuditCCIE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-accent-green transition-colors duration-200"
            title="@DeFiAuditCCIE on X"
          >
            <Twitter className="w-4 h-4" />
          </a>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <p className="text-xs text-text-muted">
            v0.2.0 — Enhanced
          </p>
        </div>
      </div>
    </aside>
  );
}
