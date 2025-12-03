-- Migration: Create ai_conversations table
-- Purpose: Log all AI chat interactions for analytics and compliance
-- Created: 2025-12-03

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  model_used TEXT NOT NULL CHECK (model_used IN ('gpt-4', 'dolphin-mistral')),
  is_uncensored BOOLEAN NOT NULL DEFAULT false,
  tokens_prompt INTEGER DEFAULT NULL,
  tokens_completion INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying by user_id and created_at (common queries)
CREATE INDEX idx_ai_conversations_user_created 
ON ai_conversations(user_id, created_at DESC);

-- Index for analytics (model usage by date)
CREATE INDEX idx_ai_conversations_model_date 
ON ai_conversations(model_used, created_at DESC);

-- Index for finding uncensored mode usage
CREATE INDEX idx_ai_conversations_uncensored 
ON ai_conversations(is_uncensored, created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own conversations
CREATE POLICY "Users can view their own conversations"
ON ai_conversations
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own conversations
CREATE POLICY "Users can insert their own conversations"
ON ai_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Prevent direct updates (conversations are immutable)
CREATE POLICY "Prevent updates to conversations"
ON ai_conversations
FOR UPDATE
USING (false);

-- RLS Policy: Users can delete their own conversations
CREATE POLICY "Users can delete their own conversations"
ON ai_conversations
FOR DELETE
USING (auth.uid() = user_id);
