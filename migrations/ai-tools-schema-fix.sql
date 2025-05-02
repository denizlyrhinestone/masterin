-- Add missing foreign key constraints to ai_conversations table
ALTER TABLE ai_conversations 
ADD CONSTRAINT fk_ai_conversations_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing foreign key constraints to ai_conversation_messages table
ALTER TABLE ai_conversation_messages 
ADD CONSTRAINT fk_ai_conversation_messages_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE;

-- Add missing foreign key constraints to message_attachments table
ALTER TABLE message_attachments
ADD CONSTRAINT fk_message_attachments_message_id
FOREIGN KEY (message_id) REFERENCES ai_conversation_messages(id) ON DELETE CASCADE;

-- Add missing foreign key constraints to ai_saved_content table
ALTER TABLE ai_saved_content 
ADD CONSTRAINT fk_ai_saved_content_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
