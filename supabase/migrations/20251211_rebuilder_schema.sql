
-- Website Rebuilds: Stores the analysis and generation results
CREATE TABLE IF NOT EXISTS rebuild_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'analyzing', 'generating', 'completed', 'failed'
    
    -- Analysis Data
    analysis_json JSONB, -- Stores structure, color palette, detected fonts
    
    -- Generation Data
    generated_code TEXT, -- The full React component code
    preview_image_url TEXT, -- Optional screenshot
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID DEFAULT auth.uid()
);

-- RLS Policies
ALTER TABLE rebuild_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rebuilds" ON rebuild_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create rebuilds" ON rebuild_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rebuilds" ON rebuild_projects FOR UPDATE USING (auth.uid() = user_id);
