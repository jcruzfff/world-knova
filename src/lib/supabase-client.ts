// Enhanced Supabase client for Knova
// Replaces Prisma with typed database operations

import { SupabaseClient, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getSupabaseClient, getSupabaseAdminClient } from './supabase';
import { Database, UserRow, MarketRow, PredictionRow, TransactionRow } from '@/types/database.types';
import type { 
  MarketCategory, 
  MarketOption, 
  User, 
  Market, 
  Prediction, 
  Transaction 
} from '@/types';

// Get typed client instances
const supabase = getSupabaseClient() as SupabaseClient<Database>;
const supabaseAdmin = getSupabaseAdminClient() as SupabaseClient<Database>;

// Export admin client function for API routes
export { getSupabaseAdminClient };

// Enhanced client with typed operations
export class SupabaseService {
  private client: SupabaseClient<Database>
  private adminClient: SupabaseClient<Database>

  constructor() {
    this.client = supabase
    this.adminClient = supabaseAdmin
  }

  // User operations (using admin client for creation to bypass RLS)
  async createUser(userData: Partial<UserRow>): Promise<{ data: User | null; error: unknown }> {
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

  async getUserByWalletAddress(walletAddress: string): Promise<{ data: User | null; error: unknown }> {
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

  async getUserById(id: string): Promise<{ data: User | null; error: unknown }> {
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

  async updateUser(id: string, updates: Partial<UserRow>): Promise<{ data: User | null; error: unknown }> {
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
  async createMarket(marketData: Partial<MarketRow>): Promise<{ data: Market | null; error: unknown }> {
    const { data, error } = await this.adminClient // Use admin client to bypass RLS
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
  }): Promise<{ data: Market[]; error: unknown; count: number | null }> {
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

  async getMarketById(id: string): Promise<{ data: Market | null; error: unknown }> {
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
  async createPrediction(predictionData: Partial<PredictionRow>): Promise<{ data: Prediction | null; error: unknown }> {
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

  async getUserPredictions(userId: string): Promise<{ data: Prediction[]; error: unknown }> {
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

  async getMarketPredictions(marketId: string): Promise<{ data: Prediction[]; error: unknown }> {
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
  async createTransaction(transactionData: Partial<TransactionRow>): Promise<{ data: Transaction | null; error: unknown }> {
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

  // Image upload operations
  async createUploadedImage(imageData: {
    file_name: string;
    original_name: string;
    file_size: number;
    file_type: string;
    storage_path: string;
    public_url: string;
    upload_type: 'market-option' | 'market-header' | 'profile' | 'other';
    uploaded_by: string;
    market_id?: string | null;
    metadata?: Record<string, unknown>;
    is_active?: boolean;
    is_deleted?: boolean;
  }): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
    const { data, error } = await this.adminClient // Use admin client to bypass RLS
      .from('uploaded_images')
      .insert([{
        file_name: imageData.file_name,
        original_name: imageData.original_name,
        file_size: imageData.file_size,
        file_type: imageData.file_type,
        storage_path: imageData.storage_path,
        public_url: imageData.public_url,
        upload_type: imageData.upload_type,
        uploaded_by: imageData.uploaded_by,
        market_id: imageData.market_id || null,
        metadata: imageData.metadata || null,
        is_active: imageData.is_active ?? true,
        is_deleted: imageData.is_deleted ?? false,
      }])
      .select()
      .single()

    return { data, error }
  }

  async getUploadedImages(filters: {
    uploaded_by?: string;
    option_ids?: string[];
    is_active?: boolean;
    is_deleted?: boolean;
  }): Promise<{ data: Record<string, unknown>[] | null; error: unknown }> {
    let query = this.adminClient // Use admin client for consistent access
      .from('uploaded_images')
      .select('id, public_url, metadata, created_at')

    if (filters.uploaded_by) {
      query = query.eq('uploaded_by', filters.uploaded_by)
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters.is_deleted !== undefined) {
      query = query.eq('is_deleted', filters.is_deleted)
    }

    if (filters.option_ids && filters.option_ids.length > 0) {
      // Query JSONB metadata field for optionId
      const optionFilters = filters.option_ids.map(id => `metadata->>optionId.eq.${id}`).join(',')
      query = query.or(optionFilters)
    }

    const { data, error } = await query

    return { data, error }
  }

  async updateUploadedImagesWithMarketId(
    userId: string, 
    optionIds: string[], 
    marketId: string
  ): Promise<{ success: boolean; updatedCount: number; error?: unknown }> {
    let updatedCount = 0;
    let lastError = null;

    for (const optionId of optionIds) {
      const { error, count } = await this.adminClient // Use admin client to bypass RLS
        .from('uploaded_images')
        .update({ market_id: marketId })
        .eq('uploaded_by', userId)
        .eq('metadata->>optionId', optionId)
        .eq('is_active', true)
        .eq('is_deleted', false)

      if (error) {
        lastError = error;
        console.error(`❌ Failed to update images for option ${optionId}:`, error);
      } else {
        updatedCount += count || 0;
      }
    }

    return {
      success: !lastError,
      updatedCount,
      error: lastError
    }
  }

  // Real-time subscriptions
  subscribeToMarketUpdates(marketId: string, callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void) {
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

  subscribeToUserUpdates(userId: string, callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void) {
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

  // Transform database rows to app types
  private transformUserRow(userRow: UserRow): User {
    return {
      id: userRow.id,
      email: userRow.email,
      emailVerified: userRow.email_verified ? new Date(userRow.email_verified) : null,
      image: userRow.image,
      name: userRow.name,
      walletAddress: userRow.wallet_address,
      username: userRow.username,
      displayName: userRow.display_name,
      profilePictureUrl: userRow.profile_picture_url,
      worldIdVerified: userRow.world_id_verified,
      verificationLevel: userRow.verification_level,
      worldIdNullifier: userRow.world_id_nullifier,
      verifiedAt: userRow.verified_at ? new Date(userRow.verified_at) : null,
      isProfileComplete: userRow.is_profile_complete,
      age: userRow.age,
      countryCode: userRow.country_code,
      region: userRow.region,
      isEligible: userRow.is_eligible,
      termsAcceptedAt: userRow.terms_accepted_at ? new Date(userRow.terms_accepted_at) : null,
      privacyAcceptedAt: userRow.privacy_accepted_at ? new Date(userRow.privacy_accepted_at) : null,
      currentStreak: userRow.current_streak,
      longestStreak: userRow.longest_streak,
      lastActiveDate: userRow.last_active_date ? new Date(userRow.last_active_date) : null,
      totalVisitDays: userRow.total_visit_days,
      preferredCurrency: userRow.preferred_currency,
      darkMode: userRow.dark_mode,
      favoriteCategories: userRow.favorite_categories as MarketCategory[],
      profileVisibility: userRow.profile_visibility,
      showPredictionHistory: userRow.show_prediction_history,
      showStreak: userRow.show_streak,
      allowChallenges: userRow.allow_challenges,
      notifyFollows: userRow.notify_follows,
      notifyChallenges: userRow.notify_challenges,
      notifyMarketUpdates: userRow.notify_market_updates,
      notifyResults: userRow.notify_results,
      notifyStreakReminders: userRow.notify_streak_reminders,
      createdAt: new Date(userRow.created_at),
      updatedAt: new Date(userRow.updated_at)
    }
  }

  private transformMarketRow(marketRow: MarketRow): Market {
    return {
      id: marketRow.id,
      title: marketRow.title,
      description: marketRow.description,
      category: marketRow.category,
      customCategory: marketRow.custom_category,
      outcomeType: marketRow.outcome_type,
      options: (marketRow.options as unknown as MarketOption[]) || [],
      minStake: marketRow.min_stake,
      maxStake: marketRow.max_stake,
      totalPool: marketRow.total_pool,
      startTime: new Date(marketRow.start_time),
      endTime: new Date(marketRow.end_time),
      resolutionTime: marketRow.resolution_time ? new Date(marketRow.resolution_time) : null,
      status: marketRow.status,
      resolvedOutcome: marketRow.resolved_outcome,
      resolutionCriteria: marketRow.resolution_criteria,
      createdBy: marketRow.created_by,
      oracleSource: marketRow.oracle_source,
      oracleId: marketRow.oracle_id,
      imageUrl: marketRow.image_url,
      tags: marketRow.tags,
      participantCount: marketRow.participant_count,
      viewCount: marketRow.view_count,
      createdAt: new Date(marketRow.created_at),
      updatedAt: new Date(marketRow.updated_at)
    }
  }

  private transformPredictionRow(predictionRow: PredictionRow): Prediction {
    return {
      id: predictionRow.id,
      userId: predictionRow.user_id,
      marketId: predictionRow.market_id,
      outcome: predictionRow.outcome,
      stake: predictionRow.stake,
      odds: predictionRow.odds,
      potentialPayout: predictionRow.potential_payout,
      status: predictionRow.status,
      payout: predictionRow.payout,
      createdAt: new Date(predictionRow.created_at),
      updatedAt: new Date(predictionRow.updated_at)
    }
  }

  private transformTransactionRow(transactionRow: TransactionRow): Transaction {
    return {
      id: transactionRow.id,
      userId: transactionRow.user_id,
      type: transactionRow.type,
      amount: transactionRow.amount,
      currency: transactionRow.currency,
      txHash: transactionRow.tx_hash,
      blockNumber: transactionRow.block_number,
      gasUsed: transactionRow.gas_used,
      predictionId: transactionRow.prediction_id,
      marketId: transactionRow.market_id,
      status: transactionRow.status,
      createdAt: new Date(transactionRow.created_at),
      updatedAt: new Date(transactionRow.updated_at)
    }
  }
}

// Create singleton instance
export const supabaseService = new SupabaseService()

// Export default client for direct usage
export default supabase 