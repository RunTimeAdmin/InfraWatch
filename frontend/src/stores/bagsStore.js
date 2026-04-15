import { create } from 'zustand';

const useBagsStore = create((set) => ({
  pools: [],
  launches: [],
  poolCount: 0,
  launchCount: 0,
  isLoading: false,
  error: null,
  lastUpdate: null,
  
  setPools: (pools) => set({ pools, poolCount: pools.length }),
  setLaunches: (launches) => set({ launches, launchCount: launches.length }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setLastUpdate: () => set({ lastUpdate: new Date() }),
}));

export default useBagsStore;
