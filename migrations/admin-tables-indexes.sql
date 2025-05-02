-- Add missing indexes to admin_logs table
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);

-- Add missing indexes to notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_sent_by ON notifications(sent_by);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Add missing indexes to security_settings table
CREATE INDEX IF NOT EXISTS idx_security_settings_updated_by ON security_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_security_settings_updated_at ON security_settings(updated_at);

-- Add missing indexes to ai_conversations table
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_tool_type ON ai_conversations(tool_type);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);

-- Add missing indexes to ai_conversation_messages table
CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_conversation_id ON ai_conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_created_at ON ai_conversation_messages(created_at);

-- Add missing indexes to message_attachments table
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_file_type ON message_attachments(file_type);
