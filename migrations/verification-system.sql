-- Create verification tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  token_type TEXT NOT NULL DEFAULT 'email_verification',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification activity tracking table
CREATE TABLE IF NOT EXISTS verification_activity (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'verification_sent', 'verification_success', 'verification_reminder', 'verification_resent'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add necessary columns to profiles table if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Create function to increment verification attempts
CREATE OR REPLACE FUNCTION increment_verification_attempts(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET verification_attempts = verification_attempts + 1,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_activity_user_id ON verification_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_activity_type ON verification_activity(activity_type);

-- Add RLS policies for verification tokens
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow the service role to access verification tokens
CREATE POLICY "Service role can do anything with verification tokens"
  ON verification_tokens
  USING (auth.role() = 'service_role');

-- Add RLS policies for verification activity
ALTER TABLE verification_activity ENABLE ROW LEVEL SECURITY;

-- Only allow the service role to insert and the user to view their own activity
CREATE POLICY "Service role can do anything with verification activity"
  ON verification_activity
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own verification activity"
  ON verification_activity
  FOR SELECT
  USING (auth.uid() = user_id);
