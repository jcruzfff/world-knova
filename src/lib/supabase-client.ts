// Enhanced Supabase client for Knova
// Replaces Prisma with typed database operations

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database, UserRow, MarketRow, PredictionRow, TransactionRow } from '@/types/database.types'
import { User, Market, Prediction, Transaction } from '@/types'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for admin operations

// Create the regular Supabase client with proper typing
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Enhanced client with typed operations
export class SupabaseService {
  private client: SupabaseClient<Database>
  private adminClient: SupabaseClient<Database>

  constructor() {
    this.client = supabase
    this.adminClient = supabaseAdmin
  }

  // User operations (using admin client for creation to bypass RLS)
  async createUser(userData: Partial<UserRow>): Promise<{ data: User | null; error: any }> {
    const { data, error } = await this.adminClient // Use admin client for user creation
      .from('users')
      .insert([{
        wallet_address: userData.wallet_address!,
        username: userData.username,
        display_name: userData.display_name,
        email: userData.email,
        profile_picture_url: userData.profile_picture_url,
        world_id_verified: userData.world_id_verified || false,
        verification_level: userData.verification_level,
        world_id_nullifier: userData.world_id_nullifier,
        is_profile_complete: userData.is_profile_complete || false,
        is_eligible: userData.is_eligible || true,
        current_streak: userData.current_streak || 0,
        longest_streak: userData.longest_streak || 0,
        total_visit_days: userData.total_visit_days || 0,
        preferred_currency: userData.preferred_currency || 'WLD',
        dark_mode: userData.dark_mode || false,
        favorite_categories: userData.favorite_categories || [],
        profile_visibility: userData.profile_visibility || 'public',
        show_prediction_history: userData.show_prediction_history ?? true,
        show_streak: userData.show_streak ?? true,
        allow_challenges: userData.allow_challenges ?? true,
        notify_follows: userData.notify_follows ?? true,
        notify_challenges: userData.notify_challenges ?? true,
        notify_market_updates: userData.notify_market_updates ?? true,
        notify_results: userData.notify_results ?? true,
        notify_streak_reminders: userData.notify_streak_reminders ?? true,
      }])
      .select()
      .single()

    return {
      data: data ? this.transformUserRow(data) : null,
      error
    }
  }

  async getUserByWalletAddress(walletAddress: string): Promise<{ data: User | null; error: any }> {
    const { data, error } = await this.adminClient // Use admin client for reliable user lookup
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    return {
      data: data ? this.transformUserRow(data) : null,
      error
    }
  }

  async getUserById(id: string): Promise<{ data: User | null; error: any }> {
    const { data, error } = await this.adminClient // Use admin client for reliable user lookup
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    return {
      data: data ? this.transformUserRow(data) : null,
      error
    }
  }

  async updateUser(id: string, updates: Partial<UserRow>): Promise<{ data: User | null; error: any }> {
    const { data, error } = await this.client // Regular client for user updates (user owns their data)
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return {
      data: data ? this.transformUserRow(data) : null,
      error
    }
  }

  // Market operations
  async createMarket(marketData: Partial<MarketRow>): Promise<{ data: Market | null; error: any }> {
    const { data, error } = await this.client
      .from('markets')
      .insert([{
        title: marketData.title!,
        description: marketData.description!,
        category: marketData.category!,
        custom_category: marketData.custom_category,
        outcome_type: marketData.outcome_type!,
        options: marketData.options!,
        resolution_criteria: marketData.resolution_criteria!,
        end_time: marketData.end_time!,
        start_time: marketData.start_time || new Date().toISOString(),
        min_stake: marketData.min_stake || 1,
        max_stake: marketData.max_stake,
        total_pool: marketData.total_pool || 0,
        status: marketData.status || 'draft',
        created_by: marketData.created_by,
        oracle_source: marketData.oracle_source,
        oracle_id: marketData.oracle_id,
        image_url: marketData.image_url,
        tags: marketData.tags || [],
        participant_count: 0,
        view_count: 0,
      }])
      .select()
      .single()

    return {
      data: data ? this.transformMarketRow(data) : null,
      error
    }
  }

  async getMarkets(filters?: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Market[]; error: any; count: number | null }> {
    let query = this.client
      .from('markets')
      .select('*, users!markets_created_by_fkey(id, username, display_name, profile_picture_url)', { count: 'exact' })

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    return {
      data: data ? data.map(row => this.transformMarketRow(row)) : [],
      error,
      count
    }
  }

  async getMarketById(id: string): Promise<{ data: Market | null; error: any }> {
    const { data, error } = await this.client
      .from('markets')
      .select('*, users!markets_created_by_fkey(id, username, display_name, profile_picture_url)')
      .eq('id', id)
      .single()

    return {
      data: data ? this.transformMarketRow(data) : null,
      error
    }
  }

  // Prediction operations
  async createPrediction(predictionData: Partial<PredictionRow>): Promise<{ data: Prediction | null; error: any }> {
    const { data, error } = await this.client
      .from('predictions')
      .insert([{
        user_id: predictionData.user_id!,
        market_id: predictionData.market_id!,
        outcome: predictionData.outcome!,
        stake: predictionData.stake!,
        odds: predictionData.odds!,
        potential_payout: predictionData.potential_payout!,
        status: predictionData.status || 'active',
      }])
      .select()
      .single()

    return {
      data: data ? this.transformPredictionRow(data) : null,
      error
    }
  }

  async getUserPredictions(userId: string): Promise<{ data: Prediction[]; error: any }> {
    const { data, error } = await this.client
      .from('predictions')
      .select('*, markets(*), users(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return {
      data: data ? data.map(row => this.transformPredictionRow(row)) : [],
      error
    }
  }

  async getMarketPredictions(marketId: string): Promise<{ data: Prediction[]; error: any }> {
    const { data, error } = await this.client
      .from('predictions')
      .select('*, users(id, username, display_name, profile_picture_url)')
      .eq('market_id', marketId)
      .order('created_at', { ascending: false })

    return {
      data: data ? data.map(row => this.transformPredictionRow(row)) : [],
      error
    }
  }

  // Transaction operations
  async createTransaction(transactionData: Partial<TransactionRow>): Promise<{ data: Transaction | null; error: any }> {
    const { data, error } = await this.client
      .from('transactions')
      .insert([{
        user_id: transactionData.user_id!,
        type: transactionData.type!,
        amount: transactionData.amount!,
        currency: transactionData.currency!,
        tx_hash: transactionData.tx_hash,
        block_number: transactionData.block_number,
        gas_used: transactionData.gas_used,
        prediction_id: transactionData.prediction_id,
        market_id: transactionData.market_id,
        status: transactionData.status || 'pending',
      }])
      .select()
      .single()

    return {
      data: data ? this.transformTransactionRow(data) : null,
      error
    }
  }

  // Real-time subscriptions
  subscribeToMarketUpdates(marketId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`market:${marketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'markets',
          filter: `id=eq.${marketId}`
        },
        callback
      )
      .subscribe()
  }

  subscribeToUserUpdates(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  // Transform database rows to application types
  private transformUserRow(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      emailVerified: row.email_verified ? new Date(row.email_verified) : null,
      image: row.image,
      name: row.name,
      walletAddress: row.wallet_address,
      username: row.username,
      displayName: row.display_name,
      profilePictureUrl: row.profile_picture_url,
      worldIdVerified: row.world_id_verified,
      verificationLevel: row.verification_level,
      worldIdNullifier: row.world_id_nullifier,
      verifiedAt: row.verified_at ? new Date(row.verified_at) : null,
      isProfileComplete: row.is_profile_complete,
      age: row.age,
      countryCode: row.country_code,
      region: row.region,
      isEligible: row.is_eligible,
      termsAcceptedAt: row.terms_accepted_at ? new Date(row.terms_accepted_at) : null,
      privacyAcceptedAt: row.privacy_accepted_at ? new Date(row.privacy_accepted_at) : null,
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      lastActiveDate: row.last_active_date ? new Date(row.last_active_date) : null,
      totalVisitDays: row.total_visit_days,
      preferredCurrency: row.preferred_currency,
      darkMode: row.dark_mode,
      favoriteCategories: row.favorite_categories as any[],
      profileVisibility: row.profile_visibility,
      showPredictionHistory: row.show_prediction_history,
      showStreak: row.show_streak,
      allowChallenges: row.allow_challenges,
      notifyFollows: row.notify_follows,
      notifyChallenges: row.notify_challenges,
      notifyMarketUpdates: row.notify_market_updates,
      notifyResults: row.notify_results,
      notifyStreakReminders: row.notify_streak_reminders,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  private transformMarketRow(row: MarketRow & { users?: any }): Market {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category as any,
      customCategory: row.custom_category,
      outcomeType: row.outcome_type as any,
      options: Array.isArray(row.options) ? row.options as any[] : [],
      minStake: row.min_stake,
      maxStake: row.max_stake,
      totalPool: row.total_pool,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      resolutionTime: row.resolution_time ? new Date(row.resolution_time) : null,
      status: row.status as any,
      resolvedOutcome: row.resolved_outcome,
      resolutionCriteria: row.resolution_criteria,
      createdBy: row.created_by,
      creator: row.users ? {
        id: row.users.id,
        username: row.users.username,
        displayName: row.users.display_name,
        profilePictureUrl: row.users.profile_picture_url,
        worldIdVerified: false, // Will be populated in joins
        currentStreak: 0,
        longestStreak: 0,
        profileVisibility: 'public' as any,
        showPredictionHistory: true,
        showStreak: true,
      } : null,
      oracleSource: row.oracle_source,
      oracleId: row.oracle_id,
      imageUrl: row.image_url,
      tags: row.tags,
      participantCount: row.participant_count,
      viewCount: row.view_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  private transformPredictionRow(row: PredictionRow): Prediction {
    return {
      id: row.id,
      userId: row.user_id,
      marketId: row.market_id,
      outcome: row.outcome,
      stake: row.stake,
      odds: row.odds,
      potentialPayout: row.potential_payout,
      status: row.status as any,
      payout: row.payout,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  private transformTransactionRow(row: TransactionRow): Transaction {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type as any,
      amount: row.amount,
      currency: row.currency as any,
      txHash: row.tx_hash,
      blockNumber: row.block_number,
      gasUsed: row.gas_used,
      predictionId: row.prediction_id,
      marketId: row.market_id,
      status: row.status as any,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }
}

// Create singleton instance
export const supabaseService = new SupabaseService()

// Export default client for direct usage
export default supabase 