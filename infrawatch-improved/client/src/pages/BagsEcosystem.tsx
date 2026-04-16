import React from 'react';
import { Card } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function BagsEcosystem() {
  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Bags Ecosystem</h2>
        <p className="text-text-muted">Ecosystem data and project metrics</p>
      </div>
      
      <Card className="metric-card p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-muted">Ecosystem Overview</p>
          <p className="text-text-dim text-sm">Project and ecosystem analytics</p>
        </div>
      </Card>
    </div>
  );
}
