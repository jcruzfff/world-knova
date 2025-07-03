// Legacy market types file - MAINTAINED FOR BACKWARDS COMPATIBILITY
// New types are in the comprehensive type system: /types/index.ts
// This file re-exports and maintains legacy interfaces

// Re-export the new comprehensive types
export * from './market.types';
export * from './user.types';
export * from './api.types';

// Maintain backwards compatibility with legacy type names
export type { 
  Market,
  MarketOption,
  MarketOptionInput,
  CreateMarketRequest,
  MarketStatus,
  MarketCategory,
  MarketCategoryFilter,
  OutcomeType,
  MarketsResponse,
  MarketFilters,
  MarketSort,
  MarketSortBy,
  SortOrder,
  CreatorStats,
  MarketAnalytics
} from './market.types';

export type { 
  MarketCreationState
} from './ui.types';

export type { 
  ApiResponse,
  ApiError,
  ApiSuccess 
} from './api.types';

export type { 
  UserProfile 
} from './user.types';

// Legacy compatibility - deprecated types (kept for existing components)
/**
 * @deprecated Use MarketCategory from new types instead
 */
export type LegacyMarketCategory = 'sports' | 'crypto' | 'music' | 'user_generated';

/**
 * @deprecated Use the creator field from UserProfile instead
 */
export interface LegacyCreatorInfo {
  id: string;
  username: string;
  displayName?: string | null;
  profilePictureUrl?: string | null;
}

/**
 * @deprecated Use recentParticipants from Market interface instead
 */
export interface LegacyParticipant {
  id: string;
  profilePictureUrl?: string | null;
  username: string;
} 