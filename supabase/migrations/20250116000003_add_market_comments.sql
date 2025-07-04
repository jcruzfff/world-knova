-- Create market_comments table
CREATE TABLE market_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_market_comments_market_id ON market_comments(market_id);
CREATE INDEX idx_market_comments_user_id ON market_comments(user_id);
CREATE INDEX idx_market_comments_created_at ON market_comments(created_at DESC);

-- Add RLS policies
ALTER TABLE market_comments ENABLE ROW LEVEL SECURITY;

-- Allow reading comments for all authenticated users
CREATE POLICY "Allow reading comments" ON market_comments 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow users to create their own comments
CREATE POLICY "Allow users to create comments" ON market_comments 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Allow users to update own comments" ON market_comments 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Allow users to delete own comments" ON market_comments 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_market_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_market_comments_updated_at
  BEFORE UPDATE ON market_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_market_comments_updated_at(); 