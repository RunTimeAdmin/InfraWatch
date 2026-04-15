import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell() {
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate connection status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid h-screen w-screen overflow-hidden bg-bg-primary" style={{ gridTemplateColumns: '15rem 1fr' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          connectionStatus={connectionStatus}
          lastUpdate={lastUpdate}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
