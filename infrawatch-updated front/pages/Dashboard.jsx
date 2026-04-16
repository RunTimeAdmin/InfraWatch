import React, { useEffect } from 'react';
import useNetworkStore from '../stores/networkStore';
import { fetchNetworkCurrent, fetchNetworkHistory, fetchEpochInfo } from '../services/networkApi';

// Dashboard components
import NetworkStatusBanner from '../components/dashboard/NetworkStatusBanner';
import TpsCard from '../components/dashboard/TpsCard';
import SlotLatencyCard from '../components/dashboard/SlotLatencyCard';
import ConfirmationTimeCard from '../components/dashboard/ConfirmationTimeCard';
import CongestionScoreCard from '../components/dashboard/CongestionScoreCard';
import DelinquentValidatorsCard from '../components/dashboard/DelinquentValidatorsCard';
import ActiveValidatorsCard from '../components/dashboard/ActiveValidatorsCard';
import EpochProgressCard from '../components/dashboard/EpochProgressCard';
import TpsHistoryChart from '../components/dashboard/TpsHistoryChart';
import WhatThisMeansPanel from '../components/dashboard/WhatThisMeansPanel';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';

export default function Dashboard() {
  const { 
    current, 
    historyRange, 
    setHistory, 
    setCurrent, 
    setEpochInfo 
  } = useNetworkStore();
  
  // Fetch initial data on mount
  useEffect(() => {
    fetchNetworkCurrent()
      .then(setCurrent)
      .catch(console.error);
    
    fetchEpochInfo()
      .then(setEpochInfo)
      .catch(console.error);
  }, [setCurrent, setEpochInfo]);
  
  // Fetch history when range changes
  useEffect(() => {
    fetchNetworkHistory(historyRange)
      .then(setHistory)
      .catch(console.error);
  }, [historyRange, setHistory]);
  
  // Render loading state if no data yet
  if (!current) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="space-y-6 pb-6">
      {/* Network Status Banner */}
      <NetworkStatusBanner />
      
      {/* Primary Metrics Grid - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TpsCard />
        <SlotLatencyCard />
        <ConfirmationTimeCard />
        <CongestionScoreCard />
      </div>
      
      {/* Secondary Metrics - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DelinquentValidatorsCard />
        <ActiveValidatorsCard />
      </div>
      
      {/* Epoch Progress - full width */}
      <EpochProgressCard />
      
      {/* TPS History Chart - full width */}
      <TpsHistoryChart />
      
      {/* What This Means Panel - full width */}
      <WhatThisMeansPanel />
    </div>
  );
}
