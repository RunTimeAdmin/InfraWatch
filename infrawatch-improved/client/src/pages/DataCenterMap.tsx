import React from 'react';
import { Card } from '@/components/ui/card';
import { Map } from 'lucide-react';

export default function DataCenterMap() {
  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Global Data Center Map</h2>
        <p className="text-text-muted">Geographic distribution of validators and infrastructure</p>
      </div>
      
      <Card className="metric-card p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <Map className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-muted">Data Center Map</p>
          <p className="text-text-dim text-sm">Interactive geographic visualization</p>
        </div>
      </Card>
    </div>
  );
}
