import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * AppLayout - Main application layout wrapper
 * Provides consistent sidebar, header, and content area structure
 * across all pages.
 */
interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="grid h-screen w-screen overflow-hidden bg-background" style={{ gridTemplateColumns: '15rem 1fr' }}>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
