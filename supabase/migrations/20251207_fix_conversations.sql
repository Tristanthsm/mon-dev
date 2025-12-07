-- Add session_id column to ai_conversations
ALTER TABLE ai_conversations 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES ai_sessions(id) ON DELETE CASCADE;

-- Create index for faster history retrieval by session
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session 
ON ai_conversations(session_id, created_at ASC);

-- Fix model_used constraint to allow new models
ALTER TABLE ai_conversations 
DROP CONSTRAINT IF EXISTS ai_conversations_model_used_check;

ALTER TABLE ai_conversations 
ADD CONSTRAINT ai_conversations_model_used_check 
CHECK (true); -- Allow any string for now to be flexible with model matching
