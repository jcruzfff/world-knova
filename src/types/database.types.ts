// Supabase database types for Knova
// Contains database row types and query builders

// Basic JSON type for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdateData
      }
      markets: {
        Row: MarketRow
        Insert: MarketInsert
        Update: MarketUpdateData
      }
      predictions: {
        Row: PredictionRow
        Insert: Omit<PredictionRow, 'id' | 'created_at' | 'updated_at'>
        Update: PredictionUpdateData
      }
      transactions: {
        Row: TransactionRow
        Insert: Omit<TransactionRow, 'id' | 'created_at' | 'updated_at'>
        Update: TransactionUpdateData
      }
    }
  }
}

// Database row types that match our schema
export interface UserRow {
  id: string
  email: string | null
  email_verified: string | null
  image: string | null
  name: string | null
  wallet_address: string
  username: string | null
  display_name: string | null
  profile_picture_url: string | null
  world_id_verified: boolean
  verification_level: 'device' | 'orb' | null
  world_id_nullifier: string | null
  verified_at: string | null
  is_profile_complete: boolean
  age: number | null
  country_code: string | null
  region: string | null
  is_eligible: boolean
  terms_accepted_at: string | null
  privacy_accepted_at: string | null
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  total_visit_days: number
  preferred_currency: 'WLD' | 'USDC' | 'ETH'
  dark_mode: boolean
  favorite_categories: string[]
  profile_visibility: 'public' | 'verified_only' | 'private'
  show_prediction_history: boolean
  show_streak: boolean
  allow_challenges: boolean
  notify_follows: boolean
  notify_challenges: boolean
  notify_market_updates: boolean
  notify_results: boolean
  notify_streak_reminders: boolean
  created_at: string
  updated_at: string
}

export interface MarketRow {
  id: string
  title: string
  description: string
  category: 'sports' | 'crypto' | 'music' | 'user_generated'
  custom_category: string | null
  outcome_type: 'binary' | 'multiple' | 'scalar'
  options: Json
  min_stake: number
  max_stake: number | null
  total_pool: number
  start_time: string
  end_time: string
  resolution_time: string | null
  status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'closed' | 'resolved' | 'cancelled'
  resolved_outcome: string | null
  resolution_criteria: string
  created_by: string | null
  oracle_source: string | null
  oracle_id: string | null
  image_url: string | null
  tags: string[]
  participant_count: number
  view_count: number
  created_at: string
  updated_at: string
}

export interface PredictionRow {
  id: string
  user_id: string
  market_id: string
  outcome: string
  stake: number
  odds: number
  potential_payout: number
  status: 'active' | 'won' | 'lost' | 'refunded'
  payout: number | null
  created_at: string
  updated_at: string
}

export interface TransactionRow {
  id: string
  user_id: string
  type: 'deposit' | 'withdrawal' | 'stake' | 'payout' | 'refund'
  amount: number
  currency: 'WLD' | 'USDC' | 'ETH'
  tx_hash: string | null
  block_number: number | null
  gas_used: number | null
  prediction_id: string | null
  market_id: string | null
  status: 'pending' | 'confirmed' | 'failed'
  created_at: string
  updated_at: string
}

// Database insert types (optional fields for auto-generated values)
export interface UserInsert {
  id?: string
  email?: string | null
  email_verified?: string | null
  image?: string | null
  name?: string | null
  wallet_address: string
  username?: string | null
  display_name?: string | null
  profile_picture_url?: string | null
  world_id_verified?: boolean
  verification_level?: 'device' | 'orb' | null
  world_id_nullifier?: string | null
  verified_at?: string | null
  is_profile_complete?: boolean
  age?: number | null
  country_code?: string | null
  region?: string | null
  is_eligible?: boolean
  terms_accepted_at?: string | null
  privacy_accepted_at?: string | null
  current_streak?: number
  longest_streak?: number
  last_active_date?: string | null
  total_visit_days?: number
  preferred_currency?: 'WLD' | 'USDC' | 'ETH'
  dark_mode?: boolean
  favorite_categories?: string[]
  profile_visibility?: 'public' | 'verified_only' | 'private'
  show_prediction_history?: boolean
  show_streak?: boolean
  allow_challenges?: boolean
  notify_follows?: boolean
  notify_challenges?: boolean
  notify_market_updates?: boolean
  notify_results?: boolean
  notify_streak_reminders?: boolean
  created_at?: string
  updated_at?: string
}

export interface MarketInsert {
  id?: string
  title: string
  description: string
  category: 'sports' | 'crypto' | 'music' | 'user_generated'
  custom_category?: string | null
  outcome_type: 'binary' | 'multiple' | 'scalar'
  options: Json
  min_stake?: number
  max_stake?: number | null
  total_pool?: number
  start_time?: string
  end_time: string
  resolution_time?: string | null
  status?: 'draft' | 'pending_approval' | 'active' | 'paused' | 'closed' | 'resolved' | 'cancelled'
  resolved_outcome?: string | null
  resolution_criteria: string
  created_by?: string | null
  oracle_source?: string | null
  oracle_id?: string | null
  image_url?: string | null
  tags?: string[]
  participant_count?: number
  view_count?: number
  created_at?: string
  updated_at?: string
}

// Database update types (all fields optional)
export interface UserUpdateData extends Partial<UserInsert> {}
export interface MarketUpdateData extends Partial<MarketInsert> {}
export interface PredictionUpdateData extends Partial<Omit<PredictionRow, 'id' | 'created_at'>> {}
export interface TransactionUpdateData extends Partial<Omit<TransactionRow, 'id' | 'created_at'>> {}

// Query builder helper types
export interface DatabaseQueryOptions {
  select?: string
  limit?: number
  offset?: number
  orderBy?: {
    column: string
    ascending?: boolean
  }[]
  filters?: {
    column: string
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'contains'
    value: any
  }[]
}

// Database relationship types
export interface UserWithRelations extends UserRow {
  markets?: MarketRow[]
  predictions?: PredictionRow[]
  transactions?: TransactionRow[]
  followers?: UserRow[]
  following?: UserRow[]
}

export interface MarketWithRelations extends MarketRow {
  creator?: UserRow
  predictions?: PredictionRow[]
  participants?: UserRow[]
}

export interface PredictionWithRelations extends PredictionRow {
  user?: UserRow
  market?: MarketRow
  transactions?: TransactionRow[]
}

// Table names type for type safety
export type TableName = 'users' | 'markets' | 'predictions' | 'transactions' | 
                        'user_follows' | 'challenges' | 'user_activities' | 
                        'user_markets' | 'uploaded_images' | 'compliance_logs'

// Database connection info
export interface DatabaseConnection {
  url: string
  anonKey: string
  serviceKey?: string
}

// Migration helper types
export interface MigrationData<T> {
  table: TableName
  data: T[]
  batchSize?: number
}

export interface MigrationProgress {
  table: TableName
  totalRecords: number
  processedRecords: number
  failedRecords: number
  errors: string[]
  isComplete: boolean
  startedAt: Date
  completedAt?: Date
} 