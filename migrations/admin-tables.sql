-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  recipients_type TEXT NOT NULL,
  recipients_count INTEGER NOT NULL,
  sent_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create security_settings table
CREATE TABLE IF NOT EXISTS security_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  two_factor_required BOOLEAN DEFAULT FALSE,
  password_min_length INTEGER DEFAULT 8,
  password_require_special BOOLEAN DEFAULT TRUE,
  login_attempts_limit INTEGER DEFAULT 5,
  session_timeout_hours INTEGER DEFAULT 24,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT single_settings_record CHECK (id = 1)
);

-- Create function to get active users count
CREATE OR REPLACE FUNCTION get_active_users_count()
RETURNS TABLE (count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(DISTINCT auth.sessions.user_id)::BIGINT
  FROM auth.sessions
  WHERE created_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
