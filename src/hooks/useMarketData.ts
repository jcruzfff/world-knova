'use client';

import { useEffect } from 'react';
import { useMarkets } from '@/providers/MarketProvider';
import { MarketFilters, MarketSort } from '@/types/market';

// Hook for fetching markets with automatic loading on mount
export function useMarketList(
  initialPage = 1,
  initialLimit = 10,
  initialFilters?: MarketFilters,
  autoFetch = true
) {
  console.log('🪝 useMarketList - Hook initialized:', { initialPage, initialLimit, initialFilters, autoFetch });
  const { state, fetchMarkets, setFilters } = useMarkets();

  useEffect(() => {
    if (initialFilters) {
      console.log('🔍 useMarketList - Setting initial filters:', initialFilters);
      setFilters(initialFilters);
    }
  }, [initialFilters, setFilters]);

  useEffect(() => {
    if (autoFetch) {
      console.log('🚀 useMarketList - Auto-fetching markets:', { initialPage, initialLimit });
      fetchMarkets(initialPage, initialLimit);
    }
  }, [autoFetch, fetchMarkets, initialPage, initialLimit]);

  return {
    markets: state.markets,
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    hasNextPage: state.hasNextPage,
    hasPrevPage: state.hasPrevPage,
    isLoading: state.isLoading,
    error: state.error,
    refetch: () => fetchMarkets(initialPage, initialLimit)
  };
}

// Hook for fetching a specific market by ID
export function useMarket(marketId: string | null, autoFetch = true) {
  console.log('🪝 useMarket - Hook initialized:', { marketId, autoFetch });
  const { state, fetchMarket } = useMarkets();

  useEffect(() => {
    if (marketId && autoFetch) {
      console.log('🎯 useMarket - Auto-fetching market:', marketId);
      fetchMarket(marketId);
    }
  }, [marketId, autoFetch, fetchMarket]);

  return {
    market: state.currentMarket,
    isLoading: state.isLoadingMarket,
    error: state.marketError,
    refetch: () => marketId && fetchMarket(marketId)
  };
}

// Hook for market browsing with filters and search
export function useMarketBrowsing() {
  const { 
    state, 
    fetchMarkets, 
    setFilters, 
    setSort, 
    clearFilters, 
    searchMarkets, 
    getMarketsByCategory 
  } = useMarkets();

  const applyFilters = async (filters: MarketFilters) => {
    setFilters(filters);
    await fetchMarkets(1, 10); // Reset to first page when applying filters
  };

  const applySort = async (sort: MarketSort) => {
    setSort(sort);
    await fetchMarkets(state.currentPage, 10); // Keep current page when sorting
  };

  const loadNextPage = async () => {
    if (state.hasNextPage) {
      await fetchMarkets(state.currentPage + 1, 10);
    }
  };

  const loadPrevPage = async () => {
    if (state.hasPrevPage) {
      await fetchMarkets(state.currentPage - 1, 10);
    }
  };

  const resetFilters = async () => {
    clearFilters();
    await fetchMarkets(1, 10);
  };

  return {
    // State
    markets: state.markets,
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    hasNextPage: state.hasNextPage,
    hasPrevPage: state.hasPrevPage,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    sort: state.sort,

    // Actions
    applyFilters,
    applySort,
    loadNextPage,
    loadPrevPage,
    resetFilters,
    searchMarkets,
    getMarketsByCategory
  };
}

// Hook for market creation
export function useMarketCreation() {
  const { 
    state, 
    createMarket, 
    updateCreationState, 
    resetCreationState 
  } = useMarkets();

  const nextStep = () => {
    const currentStep = state.creationState.step;
    const totalSteps = state.creationState.totalSteps;
    
    if (currentStep < totalSteps) {
      updateCreationState({ step: currentStep + 1 });
    }
  };

  const prevStep = () => {
    const currentStep = state.creationState.step;
    
    if (currentStep > 1) {
      updateCreationState({ step: currentStep - 1 });
    }
  };

  const goToStep = (step: number) => {
    const totalSteps = state.creationState.totalSteps;
    
    if (step >= 1 && step <= totalSteps) {
      updateCreationState({ step });
    }
  };

  const updateFormData = (data: any) => {
    updateCreationState({ 
      formData: { ...state.creationState.formData, ...data }
    });
  };

  const setErrors = (errors: Record<string, string>) => {
    updateCreationState({ errors });
  };

  const setValid = (isValid: boolean) => {
    updateCreationState({ isValid });
  };

  return {
    // Creation state
    step: state.creationState.step,
    totalSteps: state.creationState.totalSteps,
    formData: state.creationState.formData,
    isValid: state.creationState.isValid,
    errors: state.creationState.errors,
    isCreating: state.isCreatingMarket,

    // Actions
    createMarket,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    setErrors,
    setValid,
    resetCreationState
  };
}

// Hook for getting markets by category (for category pages)
export function useMarketsByCategory(category: string, autoFetch = true) {
  const { state, getMarketsByCategory } = useMarkets();

  useEffect(() => {
    if (category && autoFetch) {
      getMarketsByCategory(category);
    }
  }, [category, autoFetch, getMarketsByCategory]);

  return {
    markets: state.markets,
    totalCount: state.totalCount,
    isLoading: state.isLoading,
    error: state.error,
    refetch: () => getMarketsByCategory(category)
  };
}

// Hook for search functionality
export function useMarketSearch() {
  const { state, searchMarkets } = useMarkets();

  const search = async (query: string) => {
    await searchMarkets(query);
  };

  return {
    markets: state.markets,
    totalCount: state.totalCount,
    isLoading: state.isLoading,
    error: state.error,
    currentSearch: state.filters.search,
    search
  };
}

// Hook for getting user's created markets
export function useUserMarkets(userId?: string, autoFetch = true) {
  const { state, fetchMarkets, setFilters } = useMarkets();

  useEffect(() => {
    if (userId && autoFetch) {
      setFilters({ createdBy: userId });
      fetchMarkets(1, 10);
    }
  }, [userId, autoFetch, setFilters, fetchMarkets]);

  return {
    markets: state.markets,
    totalCount: state.totalCount,
    isLoading: state.isLoading,
    error: state.error,
    refetch: () => {
      if (userId) {
        setFilters({ createdBy: userId });
        fetchMarkets(1, 10);
      }
    }
  };
} 