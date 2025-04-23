-- Create table for user memory
CREATE TABLE IF NOT EXISTS user_memory (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  session_id TEXT NOT NULL,
  memory_data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON user_memory(user_id);

-- Create table for message feedback
CREATE TABLE IF NOT EXISTS message_feedback (
  id SERIAL PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES chat_messages(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on message_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_message_feedback_message_id ON message_feedback(message_id);

-- Add a feedback_count column to chat_messages for analytics
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS positive_feedback_count INTEGER DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS negative_feedback_count INTEGER DEFAULT 0;

-- Create a function to update feedback counts
CREATE OR REPLACE FUNCTION update_message_feedback_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.feedback_type = 'positive' THEN
    UPDATE chat_messages SET positive_feedback_count = positive_feedback_count + 1 WHERE id = NEW.message_id;
  ELSIF NEW.feedback_type = 'negative' THEN
    UPDATE chat_messages SET negative_feedback_count = negative_feedback_count + 1 WHERE id = NEW.message_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update feedback counts when new feedback is added
CREATE TRIGGER trigger_update_message_feedback_count
AFTER INSERT ON message_feedback
FOR EACH ROW
EXECUTE FUNCTION update_message_feedback_count();

-- Create a view for feedback analytics
CREATE OR REPLACE VIEW feedback_analytics AS
SELECT
  m.id AS message_id,
  m.content AS message_content,
  m.role AS message_role,
  m.positive_feedback_count,
  m.negative_feedback_count,
  c.id AS conversation_id,
  c.user_id,
  c.title AS conversation_title,
  m.created_at AS message_created_at
FROM
  chat_messages m
JOIN
  chat_conversations c ON m.conversation_id = c.id
WHERE
  m.role = 'assistant' AND (m.positive_feedback_count > 0 OR m.negative_feedback_count > 0);
