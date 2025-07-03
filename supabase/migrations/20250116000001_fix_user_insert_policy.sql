-- Fix missing INSERT policy for users table
-- This allows new users to be created during sign up

-- Add INSERT policy for users table
CREATE POLICY "Allow new user creation" ON users
    FOR INSERT WITH CHECK (true);

-- Alternative approach: Allow insert only with service role (more secure)
-- You can use this instead if you want stricter control:
-- 
-- CREATE POLICY "Service role can create users" ON users
--     FOR INSERT WITH CHECK (auth.role() = 'service_role');
--
-- This would require using the service role key for user creation
-- instead of the anon key, which is more secure but requires backend changes. 