import { create } from 'zustand';

const useValidatorStore = create((set, get) => ({
  validators: [],
  selectedValidator: null,
  loading: true,
  error: null,
  sortField: 'score',
  sortDirection: 'desc',
  limit: 50,
  
  setValidators: (validators) => set({ validators, loading: false }),
  setSelectedValidator: (v) => set({ selectedValidator: v }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setSort: (field) => {
    const { sortField, sortDirection } = get();
    if (field === sortField) {
      set({ sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortField: field, sortDirection: 'desc' });
    }
  },
  clearSelection: () => set({ selectedValidator: null }),
}));

export default useValidatorStore;
