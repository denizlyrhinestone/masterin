-- Add missing indexes to improve query performance

-- Add index on admin_id in admin_logs table
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);

-- Add index on created_at in admin_logs table for time-based queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- Add index on recipients_type in notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_recipients_type ON notifications(recipients_type);

-- Add index on sent_by in notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_sent_by ON notifications(sent_by);

-- Add index on created_at in notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Add index on updated_by in security_settings table
CREATE INDEX IF NOT EXISTS idx_security_settings_updated_by ON security_settings(updated_by);

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_action ON admin_logs(admin_id, action);
