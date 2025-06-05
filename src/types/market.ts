// Market data types for Knova prediction markets
// Supports both curated and user-generated content

export type MarketStatus = 'draft' | 'pending_approval' | 'active' | 'paused' | 'closed' | 'resolved' | 'cancelled';
export type MarketCategory = 'sports' | 'crypto' | 'music' | 'user_generated';
export type OutcomeType = 'binary' | 'multiple' | 'scalar';

// Individual market option/outcome
export interface MarketOption {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  orderIndex: number;
}

// Market creation form data
export interface CreateMarketRequest {
  title: string;
  description: string;
  category: MarketCategory;
  customCategory?: string; // If category is 'custom'
  options: Omit<MarketOption, 'id'>[];
  endDate: Date;
  resolutionCriteria: string;
  tags?: string[];
  imageUrl?: string;
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
  minStake: number;
  maxStake?: number;
  totalPool: number;
  
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
    displayName?: string;
    profilePictureUrl?: string;
  };
  
  // Oracle data
  oracleSource?: string;
  oracleId?: string;
  
  // Metadata
  imageUrl?: string;
  tags: string[];
  
  // Stats
  participantCount: number;
  viewCount: number;
  
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
  category?: MarketCategory;
  status?: MarketStatus;
  createdBy?: string; // User ID for filtering by creator
  search?: string;
  tags?: string[];
  timeframe?: 'ending_soon' | 'new' | 'popular';
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
  data?: T;
  error?: string;
  message?: string;
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