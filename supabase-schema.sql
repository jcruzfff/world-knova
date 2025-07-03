-- Knova Supabase Database Schema
-- Migration from Prisma to Supabase
-- Follows World documentation standards for prediction markets

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types for enums
CREATE TYPE market_status AS ENUM ('draft', 'pending_approval', 'active', 'paused', 'closed', 'resolved', 'cancelled');
CREATE TYPE market_category AS ENUM ('sports', 'crypto', 'music', 'user_generated');
CREATE TYPE outcome_type AS ENUM ('binary', 'multiple', 'scalar');
CREATE TYPE verification_level AS ENUM ('device', 'orb');
CREATE TYPE profile_visibility AS ENUM ('public', 'verified_only', 'private');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'stake', 'payout', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed');
CREATE TYPE prediction_status AS ENUM ('active', 'won', 'lost', 'refunded');
CREATE TYPE challenge_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE activity_type AS ENUM ('prediction', 'follow', 'challenge', 'streak', 'achievement');
CREATE TYPE compliance_result AS ENUM ('passed', 'failed', 'pending');
CREATE TYPE upload_type AS ENUM ('market-option', 'market-header', 'profile', 'other');

-- ============================================
-- CORE USER SYSTEM
-- ============================================

-- Users table (core authentication and profile)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic profile
    email VARCHAR(255) UNIQUE,
    email_verified TIMESTAMPTZ,
    image TEXT,
    name VARCHAR(255),
    wallet_address VARCHAR(42) UNIQUE NOT NULL, -- Ethereum address format
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100), -- Custom display name for prediction markets
    profile_picture_url TEXT,
    
    -- World ID & Verification (following World documentation)
    world_id_verified BOOLEAN NOT NULL DEFAULT false,
    verification_level verification_level,
    world_id_nullifier VARCHAR(255) UNIQUE, -- World ID nullifier hash
    verified_at TIMESTAMPTZ,
    
    -- Profile & Compliance
    is_profile_complete BOOLEAN NOT NULL DEFAULT false,
    age INTEGER CHECK (age >= 13 AND age <= 120),
    country_code CHAR(2), -- ISO 3166-1 alpha-2
    region VARCHAR(100),
    is_eligible BOOLEAN NOT NULL DEFAULT false,
    terms_accepted_at TIMESTAMPTZ,
    privacy_accepted_at TIMESTAMPTZ,
    
    -- Engagement & Streaks
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    total_visit_days INTEGER NOT NULL DEFAULT 0,
    
    -- Preferences
    preferred_currency VARCHAR(10) NOT NULL DEFAULT 'WLD', -- WLD, USDC, ETH
    dark_mode BOOLEAN NOT NULL DEFAULT false,
    favorite_categories market_category[] DEFAULT '{}',
    
    -- Privacy Settings
    profile_visibility profile_visibility NOT NULL DEFAULT 'public',
    show_prediction_history BOOLEAN NOT NULL DEFAULT true,
    show_streak BOOLEAN NOT NULL DEFAULT true,
    allow_challenges BOOLEAN NOT NULL DEFAULT true,
    
    -- Notification Settings
    notify_follows BOOLEAN NOT NULL DEFAULT true,
    notify_challenges BOOLEAN NOT NULL DEFAULT true,
    notify_market_updates BOOLEAN NOT NULL DEFAULT true,
    notify_results BOOLEAN NOT NULL DEFAULT true,
    notify_streak_reminders BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User follows (social features)
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id) -- Prevent self-following
);

-- ============================================
-- PREDICTION MARKETS
-- ============================================

-- Markets table
CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category market_category NOT NULL,
    custom_category VARCHAR(100), -- For user_generated markets
    outcome_type outcome_type NOT NULL,
    options JSONB NOT NULL, -- Array of MarketOption objects
    
    -- Market configuration
    min_stake DECIMAL(20, 8) NOT NULL DEFAULT 1.0, -- Support for crypto precision
    max_stake DECIMAL(20, 8),
    total_pool DECIMAL(20, 8) NOT NULL DEFAULT 0.0,
    
    -- Timing
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ NOT NULL,
    resolution_time TIMESTAMPTZ,
    
    -- Status & resolution
    status market_status NOT NULL DEFAULT 'active',
    resolved_outcome TEXT,
    resolution_criteria TEXT NOT NULL,
    
    -- Creator (for user-generated markets)
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Oracle data
    oracle_source VARCHAR(100), -- 'sportradar', 'manual', etc.
    oracle_id VARCHAR(255),
    
    -- Metadata
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Statistics
    participant_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CHECK (end_time > start_time),
    CHECK (min_stake > 0),
    CHECK (max_stake IS NULL OR max_stake >= min_stake)
);

-- User predictions
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    
    -- Prediction details
    outcome TEXT NOT NULL, -- Selected outcome
    stake DECIMAL(20, 8) NOT NULL, -- Amount staked
    odds DECIMAL(10, 4) NOT NULL, -- Odds at time of prediction
    potential_payout DECIMAL(20, 8) NOT NULL, -- Calculated payout
    
    -- Status
    status prediction_status NOT NULL DEFAULT 'active',
    payout DECIMAL(20, 8), -- Actual payout if won
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CHECK (stake > 0),
    CHECK (odds > 0),
    CHECK (potential_payout >= stake)
);

-- User market interactions (views, favorites, etc.)
CREATE TABLE user_markets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    
    -- Interaction data
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    view_count INTEGER NOT NULL DEFAULT 0,
    last_viewed TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, market_id)
);

-- ============================================
-- SOCIAL FEATURES
-- ============================================

-- Challenge system
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    
    -- Challenge details
    message TEXT,
    status challenge_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    
    CHECK (sender_id != receiver_id) -- Prevent self-challenges
);

-- User activity feed
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity details
    type activity_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    details JSONB, -- Additional activity data
    is_public BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FINANCIAL SYSTEM
-- ============================================

-- Financial transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction details
    type transaction_type NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'WLD',
    
    -- Blockchain data
    tx_hash VARCHAR(66) UNIQUE, -- Ethereum transaction hash
    block_number BIGINT,
    gas_used DECIMAL(20, 8),
    
    -- Related objects
    prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
    market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
    
    -- Status
    status transaction_status NOT NULL DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CHECK (amount > 0)
);

-- ============================================
-- FILE MANAGEMENT
-- ============================================

-- Uploaded images tracking
CREATE TABLE uploaded_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- File details
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL, -- Size in bytes
    file_type VARCHAR(100) NOT NULL, -- MIME type
    storage_path TEXT UNIQUE NOT NULL, -- Path in Supabase storage
    public_url TEXT NOT NULL, -- Public access URL
    upload_type upload_type NOT NULL,
    
    -- Relations
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    market_id UUID REFERENCES markets(id) ON DELETE SET NULL,
    
    -- Metadata
    metadata JSONB, -- Additional metadata like compression settings, etc.
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false, -- Soft delete
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CHECK (file_size > 0)
);

-- ============================================
-- COMPLIANCE & AUDITING
-- ============================================

-- Compliance tracking
CREATE TABLE compliance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Compliance details
    action VARCHAR(100) NOT NULL, -- 'age_verification', 'region_check', etc.
    result compliance_result NOT NULL,
    details JSONB, -- Additional compliance data
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User indexes
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_world_id_nullifier ON users(world_id_nullifier) WHERE world_id_nullifier IS NOT NULL;
CREATE INDEX idx_users_world_id_verified ON users(world_id_verified) WHERE world_id_verified = true;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Market indexes
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_created_by ON markets(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX idx_markets_end_time ON markets(end_time);
CREATE INDEX idx_markets_created_at ON markets(created_at);
CREATE INDEX idx_markets_participant_count ON markets(participant_count);
CREATE INDEX idx_markets_view_count ON markets(view_count);

-- Prediction indexes
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_market_id ON predictions(market_id);
CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);

-- Transaction indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash) WHERE tx_hash IS NOT NULL;
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Social indexes
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX idx_challenges_receiver_id ON challenges(receiver_id);
CREATE INDEX idx_challenges_sender_id ON challenges(sender_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;

-- Users: Can only access their own data
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Markets: Public read, restricted write
CREATE POLICY "Anyone can view active markets" ON markets
    FOR SELECT USING (status = 'active' OR status = 'closed' OR status = 'resolved');

CREATE POLICY "Verified users can create markets" ON markets
    FOR INSERT WITH CHECK (
        auth.uid()::text = created_by::text AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND world_id_verified = true)
    );

-- Predictions: Users can manage their own
CREATE POLICY "Users can view their own predictions" ON predictions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own predictions" ON predictions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Transactions: Users can view their own
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Social features: Users control their own data
CREATE POLICY "Users can manage their follows" ON user_follows
    FOR ALL USING (
        auth.uid()::text = follower_id::text OR 
        auth.uid()::text = following_id::text
    );

CREATE POLICY "Users can view challenges sent to them" ON challenges
    FOR SELECT USING (
        auth.uid()::text = receiver_id::text OR 
        auth.uid()::text = sender_id::text
    );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_markets_updated_at BEFORE UPDATE ON user_markets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uploaded_images_updated_at BEFORE UPDATE ON uploaded_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA FOR DEVELOPMENT
-- ============================================

-- Insert sample market categories for testing
-- Note: This would be handled by your application logic in production

-- Schema creation complete
-- Run this in your Supabase SQL editor to create the database schema 