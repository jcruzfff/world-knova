'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { 
  Market, 
  MarketsResponse, 
  MarketFilters, 
  MarketSort, 
  CreateMarketRequest,
  MarketCreationState,
  ApiResponse,
  MarketCategory
} from '@/types/market';

// Market state interface
interface MarketState {
  // Market browsing state
  markets: Market[];
  currentMarket: Market | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // Loading states
  isLoading: boolean;
  isLoadingMarket: boolean;
  isCreatingMarket: boolean;
  
  // Error states
  error: string | null;
  marketError: string | null;
  
  // Filters and sorting
  filters: MarketFilters;
  sort: MarketSort;
  
  // Market creation state
  creationState: MarketCreationState;
}

// Action types
type MarketAction =
  // Market loading actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_MARKET'; payload: boolean }
  | { type: 'SET_CREATING_MARKET'; payload: boolean }
  
  // Market data actions
  | { type: 'SET_MARKETS'; payload: MarketsResponse }
  | { type: 'SET_CURRENT_MARKET'; payload: Market | null }
  | { type: 'ADD_MARKET'; payload: Market }
  | { type: 'UPDATE_MARKET'; payload: Market }
  
  // Error actions
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MARKET_ERROR'; payload: string | null }
  
  // Filter and sort actions
  | { type: 'SET_FILTERS'; payload: MarketFilters }
  | { type: 'SET_SORT'; payload: MarketSort }
  | { type: 'CLEAR_FILTERS' }
  
  // Market creation actions
  | { type: 'SET_CREATION_STATE'; payload: Partial<MarketCreationState> }
  | { type: 'RESET_CREATION_STATE' };

// Initial state
const initialState: MarketState = {
  markets: [],
  currentMarket: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
  isLoading: false,
  isLoadingMarket: false,
  isCreatingMarket: false,
  error: null,
  marketError: null,
  filters: {},
  sort: { sortBy: 'created_at', order: 'desc' },
  creationState: {
    step: 1,
    totalSteps: 4,
    formData: {},
    isValid: false,
    errors: {}
  }
};

// Reducer function
function marketReducer(state: MarketState, action: MarketAction): MarketState {
  console.log('🔄 MarketReducer - Action dispatched:', action.type, 'payload' in action ? action.payload : 'no payload');
  
  switch (action.type) {
    case 'SET_LOADING':
      console.log('⏳ MarketReducer - Setting loading state:', action.payload);
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_LOADING_MARKET':
      console.log('⏳ MarketReducer - Setting market loading state:', action.payload);
      return { ...state, isLoadingMarket: action.payload, marketError: null };
    case 'SET_CREATING_MARKET':
      console.log('🚀 MarketReducer - Setting creating market state:', action.payload);
      return { ...state, isCreatingMarket: action.payload };
    
    case 'SET_MARKETS':
      console.log('📊 MarketReducer - Setting markets:', {
        count: action.payload.markets.length,
        totalCount: action.payload.totalCount,
        currentPage: action.payload.currentPage
      });
      return {
        ...state,
        markets: action.payload.markets,
        totalCount: action.payload.totalCount,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        hasNextPage: action.payload.hasNextPage,
        hasPrevPage: action.payload.hasPrevPage,
        isLoading: false,
        error: null
      };
    
    case 'SET_CURRENT_MARKET':
      console.log('🎯 MarketReducer - Setting current market:', 
        action.payload ? { id: action.payload.id, title: action.payload.title } : 'null'
      );
      return { 
        ...state, 
        currentMarket: action.payload, 
        isLoadingMarket: false, 
        marketError: null 
      };
    
    case 'ADD_MARKET':
      console.log('➕ MarketReducer - Adding new market:', {
        id: action.payload.id,
        title: action.payload.title,
        totalMarkets: state.markets.length + 1
      });
      return {
        ...state,
        markets: [action.payload, ...state.markets],
        totalCount: state.totalCount + 1,
        isCreatingMarket: false
      };
    
    case 'UPDATE_MARKET':
      return {
        ...state,
        markets: state.markets.map(market => 
          market.id === action.payload.id ? action.payload : market
        ),
        currentMarket: state.currentMarket?.id === action.payload.id 
          ? action.payload 
          : state.currentMarket
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_MARKET_ERROR':
      return { ...state, marketError: action.payload, isLoadingMarket: false };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'CLEAR_FILTERS':
      return { ...state, filters: {} };
    
    case 'SET_CREATION_STATE':
      return {
        ...state,
        creationState: { ...state.creationState, ...action.payload }
      };
    case 'RESET_CREATION_STATE':
      return { ...state, creationState: initialState.creationState };
    
    default:
      return state;
  }
}

// Context interface
interface MarketContextType {
  state: MarketState;
  
  // Market browsing functions
  fetchMarkets: (page?: number, limit?: number) => Promise<void>;
  fetchMarket: (id: string) => Promise<void>;
  setFilters: (filters: MarketFilters) => void;
  setSort: (sort: MarketSort) => void;
  clearFilters: () => void;
  
  // Market creation functions
  createMarket: (marketData: CreateMarketRequest) => Promise<Market | null>;
  updateCreationState: (updates: Partial<MarketCreationState>) => void;
  resetCreationState: () => void;
  
  // Utility functions
  searchMarkets: (query: string) => Promise<void>;
  getMarketsByCategory: (category: string) => Promise<void>;
}

// Create context
const MarketContext = createContext<MarketContextType | undefined>(undefined);

// Provider component
export function MarketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(marketReducer, initialState);

  // Fetch markets with filters and pagination
  const fetchMarkets = useCallback(async (page = 1, limit = 10) => {
    console.log('🔍 MarketProvider - fetchMarkets called:', { page, limit, filters: state.filters });
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(state.filters.category && { category: state.filters.category }),
        ...(state.filters.status && { status: state.filters.status }),
        ...(state.filters.search && { search: state.filters.search }),
        ...(state.filters.createdBy && { createdBy: state.filters.createdBy })
      });

      console.log('📡 MarketProvider - Making API request to:', `/api/markets?${params}`);
      const response = await fetch(`/api/markets?${params}`);
      const result: ApiResponse<MarketsResponse> = await response.json();

      console.log('📡 MarketProvider - API response received:', { success: result.success, marketsCount: result.data?.markets.length });

      if (result.success && result.data) {
        dispatch({ type: 'SET_MARKETS', payload: result.data });
      } else {
        console.error('❌ MarketProvider - API error:', result.error);
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to fetch markets' });
      }
    } catch (error) {
      console.error('❌ MarketProvider - Failed to fetch markets:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch markets' });
    }
  }, [state.filters]);

  // Fetch individual market
  const fetchMarket = useCallback(async (id: string) => {
    console.log('🎯 MarketProvider - fetchMarket called:', { id });
    dispatch({ type: 'SET_LOADING_MARKET', payload: true });
    
    try {
      console.log('📡 MarketProvider - Making API request to:', `/api/markets/${id}`);
      const response = await fetch(`/api/markets/${id}`);
      const result: ApiResponse<Market> = await response.json();

      console.log('📡 MarketProvider - Market API response received:', { success: result.success, marketId: result.data?.id });

      if (result.success && result.data) {
        dispatch({ type: 'SET_CURRENT_MARKET', payload: result.data });
      } else {
        console.error('❌ MarketProvider - Market API error:', result.error);
        dispatch({ type: 'SET_MARKET_ERROR', payload: result.error || 'Failed to fetch market' });
      }
    } catch (error) {
      console.error('❌ MarketProvider - Failed to fetch market:', error);
      dispatch({ type: 'SET_MARKET_ERROR', payload: 'Failed to fetch market' });
    }
  }, []);

  // Create new market
  const createMarket = useCallback(async (marketData: CreateMarketRequest): Promise<Market | null> => {
    console.log('🚀 MarketProvider - createMarket called:', { title: marketData.title, category: marketData.category });
    dispatch({ type: 'SET_CREATING_MARKET', payload: true });
    
    try {
      console.log('📡 MarketProvider - Making POST request to /api/markets');
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData)
      });

      const result: ApiResponse<Market> = await response.json();
      console.log('📡 MarketProvider - Create market API response:', { success: result.success, marketId: result.data?.id });

      if (result.success && result.data) {
        dispatch({ type: 'ADD_MARKET', payload: result.data });
        dispatch({ type: 'RESET_CREATION_STATE' });
        console.log('✅ MarketProvider - Market created successfully:', result.data.id);
        return result.data;
      } else {
        console.error('❌ MarketProvider - Create market API error:', result.error);
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to create market' });
        dispatch({ type: 'SET_CREATING_MARKET', payload: false });
        return null;
      }
    } catch (error) {
      console.error('❌ MarketProvider - Failed to create market:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create market' });
      dispatch({ type: 'SET_CREATING_MARKET', payload: false });
      return null;
    }
  }, []);

  // Filter and search functions
  const setFilters = useCallback((filters: MarketFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSort = useCallback((sort: MarketSort) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const searchMarkets = useCallback(async (query: string) => {
    setFilters({ ...state.filters, search: query });
    await fetchMarkets(1, 10);
  }, [state.filters, fetchMarkets, setFilters]);

  const getMarketsByCategory = useCallback(async (category: string) => {
    setFilters({ ...state.filters, category: category as MarketCategory });
    await fetchMarkets(1, 10);
  }, [state.filters, fetchMarkets, setFilters]);

  // Creation state management
  const updateCreationState = useCallback((updates: Partial<MarketCreationState>) => {
    dispatch({ type: 'SET_CREATION_STATE', payload: updates });
  }, []);

  const resetCreationState = useCallback(() => {
    dispatch({ type: 'RESET_CREATION_STATE' });
  }, []);

  const contextValue: MarketContextType = {
    state,
    fetchMarkets,
    fetchMarket,
    setFilters,
    setSort,
    clearFilters,
    createMarket,
    updateCreationState,
    resetCreationState,
    searchMarkets,
    getMarketsByCategory
  };

  return (
    <MarketContext.Provider value={contextValue}>
      {children}
    </MarketContext.Provider>
  );
}

// Hook for using market context
export function useMarkets(): MarketContextType {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarkets must be used within a MarketProvider');
  }
  return context;
} 