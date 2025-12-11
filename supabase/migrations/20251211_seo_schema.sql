
-- SEO Audits: Stores technical analyzes of pages
CREATE TABLE IF NOT EXISTS seo_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    score INTEGER,
    status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    report JSONB, -- Stores full error list, tag analysis, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID DEFAULT auth.uid()
);

-- SEO Briefs: Stores AI-generated content strategies
CREATE TABLE IF NOT EXISTS seo_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_keyword TEXT NOT NULL,
    status TEXT DEFAULT 'generated',
    brief_data JSONB, -- Stores outline, intent, secondary keywords, title suggestions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID DEFAULT auth.uid()
);

-- RLS Policies
ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audits" ON seo_audits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create audits" ON seo_audits FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own briefs" ON seo_briefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create briefs" ON seo_briefs FOR INSERT WITH CHECK (auth.uid() = user_id);
