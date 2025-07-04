-- Fix RLS policies for custom authentication
-- This migration addresses issues with custom wallet-based auth vs Supabase Auth

-- ============================================
-- DISABLE RLS for tables used with custom auth
-- ============================================

-- Disable RLS on uploaded_images since we handle auth in API routes
ALTER TABLE uploaded_images DISABLE ROW LEVEL SECURITY;

-- Disable RLS on markets since we handle auth in API routes  
ALTER TABLE markets DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ALTERNATIVE: Enable service role bypass policies
-- (uncomment these if you prefer to keep RLS enabled)
-- ============================================

-- Service role bypass policies for all tables
-- CREATE POLICY "Service role bypass" ON users FOR ALL TO service_role USING (true);
-- CREATE POLICY "Service role bypass" ON markets FOR ALL TO service_role USING (true);
-- CREATE POLICY "Service role bypass" ON predictions FOR ALL TO service_role USING (true);
-- CREATE POLICY "Service role bypass" ON transactions FOR ALL TO service_role USING (true);
-- CREATE POLICY "Service role bypass" ON user_follows FOR ALL TO service_role USING (true);
-- CREATE POLICY "Service role bypass" ON challenges FOR ALL TO service_role USING (true);
-- CREATE POLICY "Service role bypass" ON user_activities FOR ALL TO service_role USING (true);
-- CREATE POLICY "Service role bypass" ON uploaded_images FOR ALL TO service_role USING (true);

-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('knova-project-images', 'knova-project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated uploads to storage bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'knova-project-images');

-- Allow service role full access to storage
CREATE POLICY "Service role storage access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'knova-project-images');

-- Allow public read access to storage objects
CREATE POLICY "Public storage read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'knova-project-images');

-- ============================================
-- USER CREATION POLICY (for custom auth)
-- ============================================

-- Add INSERT policy for users table (for custom wallet auth)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow new user creation'
    ) THEN
        CREATE POLICY "Allow new user creation" ON users
        FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- ============================================
-- NOTES
-- ============================================

-- This migration does the following:
-- 1. Disables RLS on uploaded_images and markets tables since your app uses custom auth
-- 2. Creates storage bucket policies for file uploads
-- 3. Adds user creation policy if it doesn't exist
-- 4. Provides commented alternatives for keeping RLS enabled with service role bypass

-- Your app uses custom wallet-based authentication instead of Supabase Auth,
-- so auth.uid() returns null, causing RLS policies expecting Supabase Auth to fail.
-- 
-- By disabling RLS on these tables, your API routes can handle authorization,
-- while the admin client (service role) can perform operations without RLS blocking them. 