import React from 'react';
import LoadingSkeleton from '../common/LoadingSkeleton';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner skeleton */}
      <LoadingSkeleton variant="card" height={80} />
      
      {/* Metric cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LoadingSkeleton variant="card" height={140} />
        <LoadingSkeleton variant="card" height={140} />
        <LoadingSkeleton variant="card" height={140} />
        <LoadingSkeleton variant="card" height={140} />
      </div>
      
      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LoadingSkeleton variant="card" height={120} />
        <LoadingSkeleton variant="card" height={120} />
      </div>
      
      {/* Epoch progress skeleton */}
      <LoadingSkeleton variant="card" height={140} />
      
      {/* Chart skeleton */}
      <LoadingSkeleton variant="chart" height={300} />
      
      {/* Info panel skeleton */}
      <LoadingSkeleton variant="card" height={120} />
    </div>
  );
}
