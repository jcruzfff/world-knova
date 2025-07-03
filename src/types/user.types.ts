// User system types for Knova prediction markets
// Matches Supabase schema and follows World documentation standards

// World ID verification levels (following World documentation)
export type VerificationLevel = 'device' | 'orb';

// Profile visibility options
export type ProfileVisibility = 'public' | 'verified_only' | 'private';

// Currency options (following World Chain documentation)
export type Currency = 'WLD' | 'USDC' | 'ETH';

// Market categories for user preferences
export type MarketCategory = 'sports' | 'crypto' | 'music' | 'user_generated';

// ✅ Main User type (matches Supabase schema exactly)
export interface User {
  id: string;                    // UUID primary key
  email?: string | null;
  emailVerified?: Date | null;   // email_verified in DB
  image?: string | null;
  name?: string | null;
  walletAddress: string;         // wallet_address in DB - Unique wallet address
  username?: string | null;      // Unique username
  displayName?: string | null;   // display_name in DB - Custom display name
  profilePictureUrl?: string | null; // profile_picture_url in DB
  
  // World ID & Verification (following World documentation)
  worldIdVerified: boolean;      // world_id_verified in DB
  verificationLevel?: VerificationLevel | null; // verification_level in DB
  worldIdNullifier?: string | null;  // world_id_nullifier in DB - Unique World ID nullifier
  verifiedAt?: Date | null;      // verified_at in DB
  
  // Profile & Compliance
  isProfileComplete: boolean;    // is_profile_complete in DB
  age?: number | null;
  countryCode?: string | null;   // country_code in DB - ISO 2-letter code
  region?: string | null;
  isEligible: boolean;          // is_eligible in DB
  termsAcceptedAt?: Date | null;  // terms_accepted_at in DB
  privacyAcceptedAt?: Date | null; // privacy_accepted_at in DB
  
  // Engagement & Streaks
  currentStreak: number;         // current_streak in DB
  longestStreak: number;         // longest_streak in DB
  lastActiveDate?: Date | null;  // last_active_date in DB
  totalVisitDays: number;        // total_visit_days in DB
  
  // Preferences
  preferredCurrency: Currency;   // preferred_currency in DB
  darkMode: boolean;            // dark_mode in DB
  favoriteCategories: MarketCategory[]; // favorite_categories in DB - Array of MarketCategory values
  
  // Privacy Settings
  profileVisibility: ProfileVisibility; // profile_visibility in DB
  showPredictionHistory: boolean; // show_prediction_history in DB
  showStreak: boolean;          // show_streak in DB
  allowChallenges: boolean;     // allow_challenges in DB
  
  // Notification Settings
  notifyFollows: boolean;       // notify_follows in DB
  notifyChallenges: boolean;    // notify_challenges in DB
  notifyMarketUpdates: boolean; // notify_market_updates in DB
  notifyResults: boolean;       // notify_results in DB
  notifyStreakReminders: boolean; // notify_streak_reminders in DB
  
  // Timestamps
  createdAt: Date;              // created_at in DB
  updatedAt: Date;              // updated_at in DB
}

// Subset for public profile display (respects privacy settings)
export interface UserProfile {
  id: string;
  username?: string | null;
  displayName?: string | null;
  profilePictureUrl?: string | null;
  worldIdVerified: boolean;
  currentStreak: number;
  longestStreak: number;
  profileVisibility: ProfileVisibility;
  showPredictionHistory: boolean;
  showStreak: boolean;
}

// User creation request (for new user registration)
export interface CreateUserRequest {
  email?: string;
  walletAddress: string;
  username?: string;
  displayName?: string;
  profilePictureUrl?: string;
  worldIdNullifier?: string;
  verificationLevel?: VerificationLevel;
}

// User update request (for profile updates)
export interface UpdateUserRequest {
  username?: string;
  displayName?: string;
  profilePictureUrl?: string;
  age?: number;
  countryCode?: string;
  region?: string;
  preferredCurrency?: Currency;
  darkMode?: boolean;
  favoriteCategories?: MarketCategory[];
  profileVisibility?: ProfileVisibility;
  showPredictionHistory?: boolean;
  showStreak?: boolean;
  allowChallenges?: boolean;
  notifyFollows?: boolean;
  notifyChallenges?: boolean;
  notifyMarketUpdates?: boolean;
  notifyResults?: boolean;
  notifyStreakReminders?: boolean;
}

// User follow relationship
export interface UserFollow {
  id: string;
  followerId: string;           // follower_id in DB
  followingId: string;          // following_id in DB
  createdAt: Date;              // created_at in DB
}

// Challenge system types
export type ChallengeStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Challenge {
  id: string;
  senderId: string;             // sender_id in DB
  receiverId: string;           // receiver_id in DB
  marketId: string;             // market_id in DB
  message?: string | null;
  status: ChallengeStatus;
  expiresAt: Date;              // expires_at in DB
  createdAt: Date;              // created_at in DB
  respondedAt?: Date | null;    // responded_at in DB
}

// User activity feed types
export type ActivityType = 'prediction' | 'follow' | 'challenge' | 'streak' | 'achievement';

export interface UserActivity {
  id: string;
  userId: string;               // user_id in DB
  type: ActivityType;
  title: string;
  details?: Record<string, any> | null; // JSON data in DB
  isPublic: boolean;            // is_public in DB
  createdAt: Date;              // created_at in DB
}

// Compliance tracking types
export type ComplianceResult = 'passed' | 'failed' | 'pending';

export interface ComplianceLog {
  id: string;
  userId: string;               // user_id in DB
  action: string;               // 'age_verification', 'region_check', etc.
  result: ComplianceResult;
  details?: Record<string, any> | null; // JSON data in DB
  ipAddress?: string | null;    // ip_address in DB
  userAgent?: string | null;    // user_agent in DB
  createdAt: Date;              // created_at in DB
}

// Session user interface (for useSession hook - preserves existing functionality)
export interface SessionUser {
  id: string;
  username: string;
  walletAddress: string;
  profilePictureUrl?: string | null;
  isProfileComplete: boolean;
  isEligible: boolean;
  verificationLevel?: string | null;
  worldIdVerified: boolean;
  age?: number | null;
  countryCode?: string | null;
  region?: string | null;
  termsAcceptedAt?: Date | null;
  privacyAcceptedAt?: Date | null;
} 