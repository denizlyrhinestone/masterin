-- Create table for message attachments
CREATE TABLE IF NOT EXISTS message_attachments (
  id SERIAL PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL,
  file_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on message_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);

-- Add has_attachments column to chat_messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS has_attachments BOOLEAN DEFAULT FALSE;

-- Create a view for messages with attachments
CREATE OR REPLACE VIEW messages_with_attachments AS
SELECT
  m.id AS message_id,
  m.conversation_id,
  m.role,
  m.content,
  m.created_at,
  json_agg(
    json_build_object(
      'id', a.file_id,
      'url', a.file_url,
      'filename', a.filename,
      'file_type', a.file_type,
      'content_type', a.content_type
    )
  ) AS attachments
FROM
  chat_messages m
JOIN
  message_attachments a ON m.id = a.message_id
WHERE
  m.has_attachments = true
GROUP BY
  m.id, m.conversation_id, m.role, m.content, m.created_at;
