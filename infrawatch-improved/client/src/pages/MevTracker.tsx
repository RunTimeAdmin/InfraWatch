import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function MevTracker() {
  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">MEV Activity Tracker</h2>
        <p className="text-text-muted">Maximal Extractable Value activity and trends</p>
      </div>
      
      <Card className="metric-card p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-muted">MEV Analytics</p>
          <p className="text-text-dim text-sm">Real-time MEV extraction metrics</p>
        </div>
      </Card>
    </div>
  );
}
