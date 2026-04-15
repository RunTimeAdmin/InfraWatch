import { useEffect } from 'react';
import { io } from 'socket.io-client';
import useNetworkStore from '../stores/networkStore';

/**
 * Transform snake_case WebSocket data to camelCase for frontend consumption
 * The backend sends snake_case fields in the WebSocket broadcast
 */
const transformNetworkData = (data) => {
  if (!data) return null;
  
  return {
    // Core metrics
    tps: data.tps ?? data.tps,
    slot: data.slot ?? data.slot_height ?? null,
    slotHeight: data.slot ?? data.slot_height ?? null,
    epoch: data.epoch ?? null,
    timestamp: data.timestamp ?? null,
    health: data.health ?? data.status ?? 'unknown',
    
    // Validator counts
    delinquentCount: data.delinquent_validators ?? data.delinquentCount ?? null,
    activeValidators: data.total_validators ?? data.active_validators ?? data.activeValidators ?? null,
    totalValidators: data.total_validators ?? data.active_validators ?? null,
    
    // Timing and latency
    slotLatencyMs: data.slot_latency_ms ?? data.slotLatencyMs ?? null,
    confirmationTimeMs: data.avg_confirmation_ms ?? data.confirmation_time_ms ?? data.confirmationTimeMs ?? null,
    avgConfirmationMs: data.avg_confirmation_ms ?? data.confirmation_time_ms ?? null,
    
    // Epoch info
    epochProgress: data.epoch_progress ?? data.epochProgress ?? null,
    epochEtaMs: data.epoch_eta_ms ?? data.epochEtaMs ?? null,
    
    // Congestion
    congestionScore: data.congestion_score ?? data.congestionScore ?? null,
    
    // Priority fees (if available)
    priorityFeeLow: data.priority_fee_low ?? data.priorityFeeLow ?? null,
    priorityFeeMedium: data.priority_fee_medium ?? data.priorityFeeMedium ?? null,
    priorityFeeHigh: data.priority_fee_high ?? data.priorityFeeHigh ?? null,
    priorityFeeVeryHigh: data.priority_fee_very_high ?? data.priorityFeeVeryHigh ?? null,
    priorityFee90th: data.priority_fee_90th ?? data.priorityFee90th ?? null,
  };
};

export default function useWebSocket() {
  const { setCurrent, setConnected } = useNetworkStore();
  
  useEffect(() => {
    const socket = io({ transports: ['websocket', 'polling'] });
    
    socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      setConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setConnected(false);
    });
    
    socket.on('network:update', (data) => {
      const transformedData = transformNetworkData(data);
      setCurrent(transformedData);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [setCurrent, setConnected]);
}
