
-- Add AI Analysis and rich metrics columns to youtube_trends
ALTER TABLE youtube_trends 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS engagement_ratios JSONB,
ADD COLUMN IF NOT EXISTS growth_metrics JSONB;

-- Update youtube_searches to store detailed stats
ALTER TABLE youtube_searches
ADD COLUMN IF NOT EXISTS volume_estimate TEXT,
ADD COLUMN IF NOT EXISTS competition_level TEXT,
ADD COLUMN IF NOT EXISTS opportunity_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_suggestions JSONB;

-- Update youtube_channels with strategy fields
ALTER TABLE youtube_channels
ADD COLUMN IF NOT EXISTS upload_frequency TEXT,
ADD COLUMN IF NOT EXISTS content_strategy JSONB,
ADD COLUMN IF NOT EXISTS recent_performance JSONB;
