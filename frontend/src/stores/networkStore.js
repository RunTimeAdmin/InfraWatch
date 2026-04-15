import { create } from 'zustand';

const MAX_TPS_HISTORY = 30;

const useNetworkStore = create((set, get) => ({
  // Current network state
  current: null,
  history: [],
  epochInfo: null,
  
  // TPS history for sparkline (accumulated from WebSocket updates)
  tpsHistory: [],
  
  // Connection state
  isConnected: false,
  lastUpdate: null,
  
  // History range
  historyRange: '1h',
  
  // Actions
  setCurrent: (data) => {
    const state = get();
    
    // Accumulate TPS history for sparkline
    let newTpsHistory = state.tpsHistory;
    if (data?.tps !== null && data?.tps !== undefined) {
      newTpsHistory = [...state.tpsHistory, { tps: data.tps, timestamp: Date.now() }];
      // Keep only last MAX_TPS_HISTORY entries
      if (newTpsHistory.length > MAX_TPS_HISTORY) {
        newTpsHistory = newTpsHistory.slice(-MAX_TPS_HISTORY);
      }
    }
    
    set({ 
      current: data, 
      lastUpdate: new Date(),
      tpsHistory: newTpsHistory
    });
  },
  setHistory: (data) => set({ history: data }),
  setEpochInfo: (data) => set({ epochInfo: data }),
  setConnected: (connected) => set({ isConnected: connected }),
  setHistoryRange: (range) => set({ historyRange: range }),
}));

export default useNetworkStore;
