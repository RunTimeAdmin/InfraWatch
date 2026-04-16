import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Activity } from 'lucide-react';

/**
 * Header - Top navigation bar with page title and connection status
 */

const pageTitles: Record<string, string> = {
  '/': 'War Room — Network Health Overview',
  '/validators': 'Validator Status',
  '/rpc': 'RPC Health Monitor',
  '/map': 'Global Data Center Map',
  '/mev': 'MEV Activity Tracker',
  '/bags': 'Bags Ecosystem',
  '/alerts': 'Active Alerts'
};

export default function Header() {
  const [location] = useLocation();
  const pageTitle = pageTitles[location] || 'InfraWatch';
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      className="h-16 bg-sidebar flex items-center justify-between px-6 sticky top-0 z-40 relative"
      style={{
        borderBottom: '1px solid rgba(0, 255, 136, 0.1)'
      }}
    >
      {/* Bottom border glow effect */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: isConnected 
            ? 'linear-gradient(90deg, transparent 0%, rgba(0, 255, 136, 0.3) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(255, 68, 68, 0.3) 50%, transparent 100%)',
          boxShadow: isConnected 
            ? '0 0 10px rgba(0, 255, 136, 0.2)'
            : '0 0 10px rgba(255, 68, 68, 0.2)'
        }}
      />
      
      {/* Page Title */}
      <h1 className="text-lg font-semibold text-text-primary tracking-tight relative z-10">
        {pageTitle}
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-6 relative z-10">
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted uppercase tracking-wider">
            Connection
          </span>
          <div className="flex items-center gap-2">
            {/* Pulsing dot for LIVE status */}
            {isConnected && (
              <span 
                className="w-2 h-2 rounded-full bg-neon-green"
                style={{
                  animation: 'connection-pulse 2s ease-in-out infinite',
                  boxShadow: '0 0 8px rgba(0, 255, 136, 0.6)'
                }}
              />
            )}
            <span className={`text-xs font-medium ${isConnected ? 'text-neon-green' : 'text-neon-red'}`}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-sidebar-border" />

        {/* Last Update */}
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-text-muted" />
          <span className="text-xs text-text-muted uppercase tracking-wider">
            Updated
          </span>
          <span 
            className="text-sm text-text-primary font-mono transition-all duration-300"
            style={{
              textShadow: currentTime ? '0 0 10px rgba(0, 255, 136, 0.2)' : 'none'
            }}
          >
            {currentTime || '—'}
          </span>
        </div>
      </div>
    </header>
  );
}
