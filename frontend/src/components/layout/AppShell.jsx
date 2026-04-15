import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useWebSocket from '../../hooks/useWebSocket';

export default function AppShell() {
  // Initialize WebSocket globally for all pages
  useWebSocket();

  return (
    <div className="grid h-screen w-screen overflow-hidden bg-bg-primary" style={{ gridTemplateColumns: '15rem 1fr' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
