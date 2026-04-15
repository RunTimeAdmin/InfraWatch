import { create } from 'zustand';

const useRpcStore = create((set) => ({
  providers: [],
  recommendation: null,
  loading: true,
  error: null,
  
  setProviders: (providers) => set({ providers, loading: false }),
  setRecommendation: (rec) => set({ recommendation: rec }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));

export default useRpcStore;
