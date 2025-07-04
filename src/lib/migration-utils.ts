// Migration utilities for transitioning from Prisma to Supabase
// Provides safe data migration and validation tools

import { supabaseService } from './supabase-client'
import { MigrationProgress, TableName } from '@/types/database.types'
import { validateMarketTitle, validateMarketDescription, isValidEmail, isValidUsername } from '@/types/validation.types'

// Legacy data structure interfaces for migration
interface LegacyUser {
  id?: string;
  walletAddress: string;
  email?: string;
  username?: string;
  displayName?: string;
  name?: string;
  profilePictureUrl?: string;
  image?: string;
  worldIdVerified?: boolean;
  verificationLevel?: string;
  worldIdNullifier?: string;
  isProfileComplete?: boolean;
  age?: number;
  countryCode?: string;
  region?: string;
  isEligible?: boolean;
  currentStreak?: number;
  longestStreak?: number;
  totalVisitDays?: number;
  preferredCurrency?: string;
  darkMode?: boolean;
  favoriteCategories?: string[];
  profileVisibility?: string;
  showPredictionHistory?: boolean;
  showStreak?: boolean;
  allowChallenges?: boolean;
  notifyFollows?: boolean;
  notifyChallenges?: boolean;
  notifyMarketUpdates?: boolean;
  notifyResults?: boolean;
  notifyStreakReminders?: boolean;
}

interface LegacyMarketOption {
  id?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  orderIndex?: number;
  odds?: number;
  percentage?: number;
  currentStake?: number;
}

interface LegacyMarket {
  id?: string;
  title: string;
  description: string;
  category?: string;
  customCategory?: string;
  outcomeType?: string;
  options?: LegacyMarketOption[];
  resolutionCriteria?: string;
  rules?: string[];
  endTime: string | Date;
  startTime?: string | Date;
  minStake?: number;
  maxStake?: number;
  totalPool?: number;
  status?: string;
  createdBy?: string;
  creator?: string;
  oracleSource?: string;
  oracleId?: string;
  imageUrl?: string;
  tags?: string[];
  participantCount?: number;
  viewCount?: number;
}

interface DatabaseRow {
  [key: string]: unknown;
}

interface UserExportData {
  user: DatabaseRow | null;
  markets: DatabaseRow[];
  predictions: DatabaseRow[];
  transactions: DatabaseRow[];
}

// Migration state management
export class MigrationManager {
  private progressMap = new Map<TableName, MigrationProgress>()

  // Initialize migration tracking
  async initializeMigration(tables: TableName[]): Promise<void> {
    for (const table of tables) {
      this.progressMap.set(table, {
        table,
        totalRecords: 0,
        processedRecords: 0,
        failedRecords: 0,
        errors: [],
        isComplete: false,
        startedAt: new Date()
      })
    }
  }

  // Get migration progress for a table
  getProgress(table: TableName): MigrationProgress | null {
    return this.progressMap.get(table) || null
  }

  // Update migration progress
  private updateProgress(table: TableName, updates: Partial<MigrationProgress>): void {
    const current = this.progressMap.get(table)
    if (current) {
      this.progressMap.set(table, { ...current, ...updates })
    }
  }

  // Migrate users from legacy data
  async migrateUsers(userData: LegacyUser[]): Promise<MigrationProgress> {
    const table: TableName = 'users'
    this.updateProgress(table, { 
      totalRecords: userData.length, 
      startedAt: new Date() 
    })

    let processedRecords = 0
    let failedRecords = 0
    const errors: string[] = []

    for (const user of userData) {
      try {
        // Validate user data
        const validationErrors = this.validateUserData(user)
        if (validationErrors.length > 0) {
          errors.push(`User ${user.id}: ${validationErrors.join(', ')}`)
          failedRecords++
          continue
        }

        // Transform and create user
        const transformedUser = this.transformLegacyUser(user)
        const { error } = await supabaseService.createUser(transformedUser)

        if (error) {
          errors.push(`User ${user.id}: ${error instanceof Error ? error.message : 'Database error'}`)
          failedRecords++
        } else {
          processedRecords++
        }

      } catch (error) {
        errors.push(`User ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        failedRecords++
      }

      // Update progress
      this.updateProgress(table, { processedRecords, failedRecords, errors })
    }

    // Mark as complete
    this.updateProgress(table, { 
      isComplete: true, 
      completedAt: new Date() 
    })

    return this.getProgress(table)!
  }

  // Migrate markets from legacy data
  async migrateMarkets(marketData: LegacyMarket[]): Promise<MigrationProgress> {
    const table: TableName = 'markets'
    this.updateProgress(table, { 
      totalRecords: marketData.length, 
      startedAt: new Date() 
    })

    let processedRecords = 0
    let failedRecords = 0
    const errors: string[] = []

    for (const market of marketData) {
      try {
        // Validate market data
        const validationErrors = this.validateMarketData(market)
        if (validationErrors.length > 0) {
          errors.push(`Market ${market.id}: ${validationErrors.join(', ')}`)
          failedRecords++
          continue
        }

        // Transform and create market
        const transformedMarket = this.transformLegacyMarket(market)
        const { error } = await supabaseService.createMarket(transformedMarket)

        if (error) {
          errors.push(`Market ${market.id}: ${error instanceof Error ? error.message : 'Database error'}`)
          failedRecords++
        } else {
          processedRecords++
        }

      } catch (error) {
        errors.push(`Market ${market.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        failedRecords++
      }

      // Update progress
      this.updateProgress(table, { processedRecords, failedRecords, errors })
    }

    // Mark as complete
    this.updateProgress(table, { 
      isComplete: true, 
      completedAt: new Date() 
    })

    return this.getProgress(table)!
  }

  // Data validation methods
  private validateUserData(user: LegacyUser): string[] {
    const errors: string[] = []

    if (!user.walletAddress || typeof user.walletAddress !== 'string') {
      errors.push('Invalid wallet address')
    }

    if (user.email && !isValidEmail(user.email)) {
      errors.push('Invalid email format')
    }

    if (user.username && !isValidUsername(user.username)) {
      errors.push('Invalid username format')
    }

    if (user.age && (typeof user.age !== 'number' || user.age < 18 || user.age > 120)) {
      errors.push('Invalid age')
    }

    return errors
  }

  private validateMarketData(market: LegacyMarket): string[] {
    const errors: string[] = []

    const titleValidation = validateMarketTitle(market.title)
    if (!titleValidation.isValid) {
      errors.push(...titleValidation.errors)
    }

    const descriptionValidation = validateMarketDescription(market.description)
    if (!descriptionValidation.isValid) {
      errors.push(...descriptionValidation.errors)
    }

    if (!market.endTime || isNaN(new Date(market.endTime).getTime())) {
      errors.push('Invalid end time')
    }

    if (!market.options || !Array.isArray(market.options) || market.options.length < 2) {
      errors.push('Must have at least 2 options')
    }

    return errors
  }

  // Data transformation methods
  private transformLegacyUser(user: LegacyUser): DatabaseRow {
    return {
      wallet_address: user.walletAddress,
      email: user.email || null,
      username: user.username || null,
      display_name: user.displayName || user.name || null,
      profile_picture_url: user.profilePictureUrl || user.image || null,
      world_id_verified: user.worldIdVerified || false,
      verification_level: user.verificationLevel || null,
      world_id_nullifier: user.worldIdNullifier || null,
      is_profile_complete: user.isProfileComplete || false,
      age: user.age || null,
      country_code: user.countryCode || null,
      region: user.region || null,
      is_eligible: user.isEligible !== undefined ? user.isEligible : true,
      current_streak: user.currentStreak || 0,
      longest_streak: user.longestStreak || 0,
      total_visit_days: user.totalVisitDays || 0,
      preferred_currency: user.preferredCurrency || 'WLD',
      dark_mode: user.darkMode || false,
      favorite_categories: user.favoriteCategories || [],
      profile_visibility: user.profileVisibility || 'public',
      show_prediction_history: user.showPredictionHistory !== undefined ? user.showPredictionHistory : true,
      show_streak: user.showStreak !== undefined ? user.showStreak : true,
      allow_challenges: user.allowChallenges !== undefined ? user.allowChallenges : true,
      notify_follows: user.notifyFollows !== undefined ? user.notifyFollows : true,
      notify_challenges: user.notifyChallenges !== undefined ? user.notifyChallenges : true,
      notify_market_updates: user.notifyMarketUpdates !== undefined ? user.notifyMarketUpdates : true,
      notify_results: user.notifyResults !== undefined ? user.notifyResults : true,
      notify_streak_reminders: user.notifyStreakReminders !== undefined ? user.notifyStreakReminders : true,
    }
  }

  private transformLegacyMarket(market: LegacyMarket): DatabaseRow {
    return {
      title: market.title,
      description: market.description,
      category: this.mapLegacyCategory(market.category || 'user_generated'),
      custom_category: market.customCategory || null,
      outcome_type: market.outcomeType || 'binary',
      options: this.transformMarketOptions(market.options || []),
      resolution_criteria: market.resolutionCriteria || market.rules?.join('; ') || 'Manual resolution',
      end_time: new Date(market.endTime).toISOString(),
      start_time: market.startTime ? new Date(market.startTime).toISOString() : new Date().toISOString(),
      min_stake: market.minStake || 1,
      max_stake: market.maxStake || null,
      total_pool: market.totalPool || 0,
      status: this.mapLegacyStatus(market.status || 'draft'),
      created_by: market.createdBy || market.creator || null,
      oracle_source: market.oracleSource || null,
      oracle_id: market.oracleId || null,
      image_url: market.imageUrl || null,
      tags: market.tags || [],
      participant_count: market.participantCount || 0,
      view_count: market.viewCount || 0,
    }
  }

  private transformMarketOptions(options: LegacyMarketOption[]): DatabaseRow[] {
    return options.map((option, index) => ({
      id: option.id || `option-${index}`,
      title: option.title,
      description: option.description || null,
      imageUrl: option.imageUrl || null,
      orderIndex: option.orderIndex !== undefined ? option.orderIndex : index,
      odds: option.odds || null,
      percentage: option.percentage || null,
      currentStake: option.currentStake || null,
    }))
  }

  private mapLegacyCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'custom': 'user_generated',
      'user_generated': 'user_generated',
      'sports': 'sports',
      'crypto': 'crypto',
      'music': 'music'
    }
    return categoryMap[category] || 'user_generated'
  }

  private mapLegacyStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'open': 'active',
      'closed': 'closed',
      'resolved': 'resolved',
      'cancelled': 'cancelled',
      'draft': 'draft',
      'pending': 'pending_approval',
      'paused': 'paused'
    }
    return statusMap[status] || 'draft'
  }

  // Cleanup and rollback utilities
  async rollbackMigration(table: TableName): Promise<boolean> {
    try {
      // This is dangerous - only use in development!
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Rollback not allowed in production')
      }

      const { error } = await supabaseService['client']
        .from(table)
        .delete()
        .neq('id', 'impossible-id') // Delete all records

      return !error
    } catch (error) {
      console.error(`Rollback failed for ${table}:`, error)
      return false
    }
  }

  // Batch processing utilities
  async processBatch<T>(
    data: T[], 
    processor: (item: T) => Promise<void>, 
    batchSize: number = 10
  ): Promise<void> {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      await Promise.all(batch.map(processor))
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

// Data export utilities
export class DataExporter {
  async exportTableToJSON(table: TableName): Promise<DatabaseRow[]> {
    const { data, error } = await supabaseService['client']
      .from(table)
      .select('*')

    if (error) {
      throw new Error(`Failed to export ${table}: ${error.message}`)
    }

    return data || []
  }

  async exportUserData(userId: string): Promise<UserExportData> {
    const [user, markets, predictions, transactions] = await Promise.all([
      supabaseService.getUserById(userId),
      supabaseService.getMarkets({ limit: 1000 }), // User's markets would need filtering
      supabaseService.getUserPredictions(userId),
      supabaseService['client'].from('transactions').select('*').eq('user_id', userId)
    ])

    return {
      user: user.data as DatabaseRow | null,
      markets: (markets.data || []) as unknown as DatabaseRow[],
      predictions: (predictions.data || []) as unknown as DatabaseRow[],
      transactions: (transactions.data || []) as unknown as DatabaseRow[]
    }
  }
}

// Testing utilities
export class MigrationTester {
  async validateDataIntegrity(): Promise<{
    userCount: number;
    marketCount: number;
    predictionCount: number;
    transactionCount: number;
    issues: string[];
  }> {
    const issues: string[] = []

    // Count records
    const [users, markets, predictions, transactions] = await Promise.all([
      supabaseService['client'].from('users').select('id', { count: 'exact' }),
      supabaseService['client'].from('markets').select('id', { count: 'exact' }),
      supabaseService['client'].from('predictions').select('id', { count: 'exact' }),
      supabaseService['client'].from('transactions').select('id', { count: 'exact' })
    ])

    // Check for orphaned records
    const { data: orphanedPredictions } = await supabaseService['client']
      .from('predictions')
      .select('id, user_id, market_id')
      .is('user_id', null)

    if (orphanedPredictions && orphanedPredictions.length > 0) {
      issues.push(`Found ${orphanedPredictions.length} predictions with null user_id`)
    }

    return {
      userCount: users.count || 0,
      marketCount: markets.count || 0,
      predictionCount: predictions.count || 0,
      transactionCount: transactions.count || 0,
      issues
    }
  }
}

// Create singleton instances
export const migrationManager = new MigrationManager()
export const dataExporter = new DataExporter()
export const migrationTester = new MigrationTester() 