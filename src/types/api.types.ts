// API request and response types for Knova
// Standardizes all API communication patterns

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string | null;
  message?: string | null;
  metadata?: {
    timestamp: Date;
    requestId?: string | null;
    version?: string | null;
  } | null;
}

// Error response structure
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Success response structure
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  metadata?: {
    timestamp: Date;
    requestId?: string | null;
    version?: string | null;
  };
}

// Pagination metadata
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  offset: number;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// File upload types (for Supabase storage)
export interface UploadImageRequest {
  file: File;
  uploadType: 'market-option' | 'market-header' | 'profile' | 'other';
  marketId?: string;
}

export interface UploadImageResponse {
  id: string;
  publicUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

// Uploaded image tracking (matches uploaded_images table)
export interface UploadedImage {
  id: string;
  fileName: string;             // file_name in DB
  originalName: string;         // original_name in DB
  fileSize: number;             // file_size in DB - Size in bytes
  fileType: string;             // file_type in DB - MIME type
  storagePath: string;          // storage_path in DB - Path in Supabase storage
  publicUrl: string;            // public_url in DB - Public access URL
  uploadType: 'market-option' | 'market-header' | 'profile' | 'other'; // upload_type in DB
  
  // Relations
  uploadedBy: string;           // uploaded_by in DB - User ID
  marketId?: string | null;     // market_id in DB - If associated with market
  
  // Metadata
  metadata?: Record<string, any> | null; // JSON data in DB
  
  // Status
  isActive: boolean;            // is_active in DB
  isDeleted: boolean;           // is_deleted in DB - Soft delete
  
  createdAt: Date;              // created_at in DB
  updatedAt: Date;              // updated_at in DB
}

// Authentication and session types
export interface LoginRequest {
  walletAddress: string;
  signature?: string;
  message?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    walletAddress: string;
    username?: string;
    worldIdVerified: boolean;
    isProfileComplete: boolean;
  };
  sessionToken?: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// World ID verification types (following World documentation)
export interface VerifyProofRequest {
  proof: {
    proof: string;
    merkle_root: string;
    nullifier_hash: string;
    verification_level: 'device' | 'orb';
  };
  action: string;
  signal?: string;
}

export interface VerifyProofResponse {
  verified: boolean;
  nullifierHash?: string;
  verificationLevel?: 'device' | 'orb';
  error?: string;
}

// Wallet balance types (for World Chain integration)
export interface WalletBalanceRequest {
  walletAddress: string;
  currencies?: string[]; // ['WLD', 'USDC', 'ETH']
}

export interface WalletBalanceResponse {
  balances: {
    currency: string;
    balance: string;          // String to handle big numbers
    formatted: string;        // Human-readable format
    decimals: number;
  }[];
  totalUsdValue?: number;
}

// Search and filter types
export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface SearchResponse<T> {
  results: T[];
  totalCount: number;
  suggestions?: string[];
  facets?: Record<string, { value: string; count: number }[]>;
}

// Webhook types (for external integrations)
export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: Date;
  signature?: string;
}

// Real-time subscription types
export interface SubscriptionMessage<T> {
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: T;
  old?: T; // For updates and deletes
  timestamp: Date;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

export interface RateLimitedResponse<T> extends ApiResponse<T> {
  rateLimit?: RateLimitInfo;
}

// Cache types
export interface CacheInfo {
  cached: boolean;
  cacheKey?: string;
  ttl?: number;
  lastModified?: Date;
}

export interface CachedResponse<T> extends ApiResponse<T> {
  cache?: CacheInfo;
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: {
    database: 'healthy' | 'degraded' | 'unhealthy';
    storage: 'healthy' | 'degraded' | 'unhealthy';
    external: 'healthy' | 'degraded' | 'unhealthy';
  };
  version: string;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface AnalyticsRequest {
  events: AnalyticsEvent[];
}

export interface AnalyticsResponse {
  processed: number;
  failed: number;
  errors?: string[];
} 