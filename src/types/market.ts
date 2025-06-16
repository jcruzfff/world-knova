// Market data types for Knova prediction markets
// Supports both curated and user-generated content

export type MarketStatus = 'draft' | 'pending_approval' | 'active' | 'paused' | 'closed' | 'resolved' | 'cancelled';
export type MarketCategory = 'sports' | 'crypto' | 'music' | 'user_generated';
export type MarketCategoryFilter = MarketCategory | 'all'; // For filtering purposes
export type OutcomeType = 'binary' | 'multiple' | 'scalar';

// Individual market option/outcome
export interface MarketOption {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  orderIndex: number;
  
  // Display properties for UI (computed from stakes/pools)
  odds?: number | null;           // Current odds multiplier (computed)
  percentage?: number | null;     // Percentage of total pool (computed)
  currentStake?: number | null;   // Current stake amount (computed)
}

// Market option for creation form (no computed fields)
export interface MarketOptionInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  // Note: id, orderIndex, odds, percentage, and currentStake are assigned by system
}

// Market creation form data
export interface CreateMarketRequest {
  title: string;
  description: string;
  category: MarketCategory;
  customCategory?: string | null; // If category is 'custom'
  options: MarketOptionInput[];
  endDate: Date;
  resolutionCriteria: string;
  tags?: string[] | null;
  imageUrl?: string | null;
}

// Full market data structure
export interface Market {
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  customCategory?: string;
  outcomeType: OutcomeType;
  options: MarketOption[];
  
  // Market configuration
  minStake: number; // Will be bigint in smart contracts
  maxStake?: number; // Will be bigint in smart contracts  
  totalPool: number; // Will be bigint in smart contracts
  
  // Timing
  startTime: Date;
  endTime: Date;
  resolutionTime?: Date;
  
  // Status & resolution
  status: MarketStatus;
  resolvedOutcome?: string;
  resolutionCriteria: string;
  
  // Creator info (for user-generated markets)
  createdBy?: {
    id: string;
    username: string;
    displayName?: string | null;
    profilePictureUrl?: string | null;
  } | null;
  creator?: string | null;        // Backward compatibility field
  
  // Oracle data  
  oracleSource?: string;
  oracleId?: string;
  
  // Additional metadata for backwards compatibility
  resolutionSource?: string | null;
  rules?: string[] | null;
  
  // Metadata
  imageUrl?: string | null;
  tags: string[];
  
  // Display properties (computed/derived)
  subtitle?: string | null;       // Short description for cards (computed from description)
  
  // Stats
  participantCount: number;
  viewCount: number;
  
  // Recent participants for avatar display (up to 5 most recent)
  recentParticipants?: Array<{
    id: string;
    profilePictureUrl?: string | null;
    username: string;
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Market list response with pagination
export interface MarketsResponse {
  markets: Market[];
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  currentPage: number;
  totalPages: number;
}

// Market filters for browsing
export interface MarketFilters {
  category?: MarketCategory | null;
  status?: MarketStatus | null;
  createdBy?: string | null; // User ID for filtering by creator
  search?: string | null;
  tags?: string[] | null;
  timeframe?: 'ending_soon' | 'new' | 'popular' | null;
}

// Market sort options
export type MarketSortBy = 'created_at' | 'end_date' | 'total_pool' | 'participant_count' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface MarketSort {
  sortBy: MarketSortBy;
  order: SortOrder;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string | null;
  message?: string | null;
  metadata?: {
    timestamp: Date;
    requestId?: string | null;
  } | null;
}

// Market creation states for form wizard
export interface MarketCreationState {
  step: number;
  totalSteps: number;
  formData: Partial<CreateMarketRequest>;
  isValid: boolean;
  errors: Record<string, string>;
}

// User's market statistics for creator dashboard
export interface CreatorStats {
  totalMarkets: number;
  activeMarkets: number;
  resolvedMarkets: number;
  totalVolume: number;
  totalParticipants: number;
  successfulPredictions: number;
}

// Market analytics data
export interface MarketAnalytics {
  marketId: string;
  views: { date: string; count: number }[];
  participants: { date: string; count: number }[];
  volume: { date: string; amount: number }[];
  outcomeDistribution: { outcome: string; percentage: number }[];
} 