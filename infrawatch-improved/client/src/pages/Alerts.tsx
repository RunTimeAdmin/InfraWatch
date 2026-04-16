import React from 'react';
import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function Alerts() {
  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Active Alerts</h2>
        <p className="text-text-muted">System alerts and notifications</p>
      </div>
      
      <Card className="metric-card p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-muted">Alert Center</p>
          <p className="text-text-dim text-sm">Real-time system alerts and events</p>
        </div>
      </Card>
    </div>
  );
}
