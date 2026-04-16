import React from 'react';
import { Card } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export default function RpcHealth() {
  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">RPC Health Monitor</h2>
        <p className="text-text-muted">Real-time RPC provider status and performance metrics</p>
      </div>
      
      <Card className="metric-card p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-muted">RPC Provider Table</p>
          <p className="text-text-dim text-sm">Uptime, latency, and request metrics</p>
        </div>
      </Card>
    </div>
  );
}
