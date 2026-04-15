import React, { useEffect, useCallback, useMemo } from 'react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ValidatorTable from '../components/validators/ValidatorTable';
import ValidatorDetailPanel from '../components/validators/ValidatorDetailPanel';
import useValidatorStore from '../stores/validatorStore';
import { fetchTopValidators } from '../services/validatorApi';

export default function Validators() {
  const {
    validators,
    selectedValidator,
    loading,
    error,
    sortField,
    sortDirection,
    setValidators,
    setSelectedValidator,
    setLoading,
    setError,
    setSort,
    clearSelection
  } = useValidatorStore();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTopValidators(50);
      setValidators(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch validators');
    }
  }, [setValidators, setLoading, setError]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSort = (field) => {
    setSort(field);
  };

  const handleSelectValidator = (validator) => {
    if (selectedValidator?.vote_pubkey === validator.vote_pubkey) {
      clearSelection();
    } else {
      setSelectedValidator(validator);
    }
  };

  const sortedValidators = useMemo(() => {
    if (!validators.length) return [];

    return [...validators].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'name':
          aVal = (a.name || a.identity_pubkey || '').toLowerCase();
          bVal = (b.name || b.identity_pubkey || '').toLowerCase();
          break;
        case 'score':
          aVal = a.score ?? -1;
          bVal = b.score ?? -1;
          break;
        case 'stake_sol':
          aVal = a.stake_sol ?? 0;
          bVal = b.stake_sol ?? 0;
          break;
        case 'commission':
          aVal = a.commission ?? 100;
          bVal = b.commission ?? 100;
          break;
        case 'skip_rate':
          aVal = a.skip_rate ?? 1;
          bVal = b.skip_rate ?? 1;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [validators, sortField, sortDirection]);

  if (loading && !validators.length) {
    return (
      <div className="space-y-6">
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6">
          <LoadingSkeleton variant="text" height="40px" width="300px" />
          <div className="mt-4 space-y-3">
            <LoadingSkeleton variant="text" height="50px" />
            <LoadingSkeleton variant="text" height="50px" />
            <LoadingSkeleton variant="text" height="50px" />
            <LoadingSkeleton variant="text" height="50px" />
            <LoadingSkeleton variant="text" height="50px" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-bg-card border border-accent-red/30 rounded-lg p-8 text-center">
          <div className="text-accent-red text-lg font-semibold mb-2">
            Error Loading Validators
          </div>
          <p className="text-text-muted mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded hover:bg-accent-green/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            VALIDATOR RANKINGS
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {validators.length} validators tracked
          </p>
        </div>
      </div>

      {/* Validator Table */}
      <div className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
            Top Performers
          </h2>
        </div>
        <ValidatorTable
          validators={sortedValidators}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          onSelectValidator={handleSelectValidator}
          selectedValidator={selectedValidator}
        />
      </div>

      {/* Detail Panel */}
      {selectedValidator && (
        <ValidatorDetailPanel
          validator={selectedValidator}
          onClose={clearSelection}
        />
      )}

      {/* Empty State */}
      {!loading && !validators.length && (
        <div className="bg-bg-card border border-border-subtle rounded-lg p-8 text-center">
          <div className="text-text-muted text-lg mb-2">
            No validators found
          </div>
          <p className="text-text-dim text-sm">
            Validator data will appear once the backend sync is complete.
          </p>
        </div>
      )}
    </div>
  );
}
