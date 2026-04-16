import React from 'react';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function Validators() {
  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Validator Rankings</h2>
        <p className="text-text-muted">Top performing validators on the Solana network</p>
      </div>
      
      <Card className="metric-card p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-muted">Validator Table</p>
          <p className="text-text-dim text-sm">Sortable validator performance metrics</p>
        </div>
      </Card>
    </div>
  );
}
