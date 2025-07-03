// Prediction and transaction types for Knova prediction markets
// Matches Supabase schema for financial operations

import { Market } from './market.types';
import { UserProfile, Currency } from './user.types';

// Prediction status lifecycle (matches enum in Supabase)
export type PredictionStatus = 'active' | 'won' | 'lost' | 'refunded';

// Transaction types (matches enum in Supabase) 
export type TransactionType = 'deposit' | 'withdrawal' | 'stake' | 'payout' | 'refund';

// Transaction status (matches enum in Supabase)
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

// ✅ User prediction (matches Supabase predictions table)
export interface Prediction {
  id: string;                    // UUID primary key
  userId: string;                // user_id in DB
  marketId: string;              // market_id in DB
  
  // Prediction details
  outcome: string;               // Selected outcome
  stake: number;                 // Amount staked (will be bigint for contracts)
  odds: number;                  // Odds at time of prediction
  potentialPayout: number;       // potential_payout in DB - Calculated payout (will be bigint)
  
  // Status and results
  status: PredictionStatus;      // Current status
  payout?: number | null;        // Actual payout if won
  
  // Timestamps
  createdAt: Date;               // created_at in DB
  updatedAt: Date;               // updated_at in DB
}

// ✅ Transaction record (matches Supabase transactions table)
export interface Transaction {
  id: string;                    // UUID primary key
  userId: string;                // user_id in DB
  
  // Transaction details
  type: TransactionType;         // Transaction type
  amount: number;                // Amount (will be bigint for contracts)
  currency: Currency;            // Currency type
  
  // Blockchain data
  txHash?: string | null;        // tx_hash in DB - Transaction hash
  blockNumber?: number | null;   // block_number in DB - Block number
  gasUsed?: number | null;       // gas_used in DB - Gas consumed
  
  // Related objects
  predictionId?: string | null;  // prediction_id in DB - Associated prediction
  marketId?: string | null;      // market_id in DB - Associated market
  
  // Status
  status: TransactionStatus;     // Transaction status
  
  // Timestamps
  createdAt: Date;               // created_at in DB
  updatedAt: Date;               // updated_at in DB
}

// Extended prediction with related data (for detailed views)
export interface PredictionWithMarket extends Prediction {
  market: Market;
  user: UserProfile;
}

// Extended prediction with user data (for market views)
export interface PredictionWithUser extends Prediction {
  user: UserProfile;
}

// Extended transaction with related data
export interface TransactionWithRelations extends Transaction {
  user?: UserProfile;
  prediction?: Prediction;
  market?: Market;
}

// Prediction creation request
export interface CreatePredictionRequest {
  marketId: string;
  outcome: string;
  stake: number;
}

// Prediction update request (limited fields that can be updated)
export interface UpdatePredictionRequest {
  status?: PredictionStatus;
  payout?: number;
}

// Transaction creation request (for blockchain operations)
export interface CreateTransactionRequest {
  type: TransactionType;
  amount: number;
  currency: Currency;
  predictionId?: string;
  marketId?: string;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: number;
}

// Prediction statistics (aggregated data)
export interface PredictionStats {
  totalPredictions: number;
  activePredictions: number;
  wonPredictions: number;
  lostPredictions: number;
  totalStaked: number;
  totalWinnings: number;
  winRate: number;              // Percentage of won predictions
  averageStake: number;
  biggestWin: number;
  currentStreak: number;        // Current winning streak
  longestWinStreak: number;     // Best winning streak
}

// User portfolio overview
export interface UserPortfolio {
  userId: string;
  totalValue: number;           // Total value of all positions
  availableBalance: number;     // Available balance for new predictions
  activePredictions: Prediction[];
  recentTransactions: Transaction[];
  stats: PredictionStats;
}

// Market prediction summary (for market pages)
export interface MarketPredictionSummary {
  marketId: string;
  totalPredictions: number;
  totalStaked: number;
  outcomes: {
    outcome: string;
    predictionCount: number;
    totalStaked: number;
    percentage: number;
  }[];
  recentPredictions: PredictionWithUser[];
}

// Leaderboard entry
export interface LeaderboardEntry {
  user: UserProfile;
  stats: PredictionStats;
  rank: number;
  change: number;               // Change in rank from previous period
}

// Prediction filters for queries
export interface PredictionFilters {
  status?: PredictionStatus | null;
  marketId?: string | null;
  outcome?: string | null;
  minStake?: number | null;
  maxStake?: number | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

// Transaction filters for queries
export interface TransactionFilters {
  type?: TransactionType | null;
  status?: TransactionStatus | null;
  currency?: Currency | null;
  marketId?: string | null;
  predictionId?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

// Pagination response for predictions
export interface PredictionsResponse {
  predictions: Prediction[];
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  currentPage: number;
  totalPages: number;
}

// Pagination response for transactions
export interface TransactionsResponse {
  transactions: Transaction[];
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  currentPage: number;
  totalPages: number;
} 