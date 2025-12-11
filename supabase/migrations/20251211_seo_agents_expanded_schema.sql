-- Add SEO Tables for Programmatic and Monitoring

-- SEO Programmatic Projects: Stores CSV upload data and templates
CREATE TABLE IF NOT EXISTS seo_programmatic_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    csv_url TEXT, -- Path to CSV in storage (or we might store small CSVs in a text column for MVP)
    template_data JSONB, -- Stores the prompt template
    preview_data JSONB, -- Stores the generated preview items
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID DEFAULT auth.uid()
);

-- SEO Monitoring Keywords: Stores keywords to track
CREATE TABLE IF NOT EXISTS seo_monitoring_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL,
    target_url TEXT,
    engine TEXT DEFAULT 'google_fr',
    current_position INTEGER, -- Nullable if not yet checked
    position_history JSONB DEFAULT '[]'::jsonb, -- Array of {date, position} objects
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID DEFAULT auth.uid()
);

-- RLS Policies
ALTER TABLE seo_programmatic_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_monitoring_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own programmatic projects" ON seo_programmatic_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create programmatic projects" ON seo_programmatic_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own programmatic projects" ON seo_programmatic_projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own monitored keywords" ON seo_monitoring_keywords FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create monitored keywords" ON seo_monitoring_keywords FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own monitored keywords" ON seo_monitoring_keywords FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own monitored keywords" ON seo_monitoring_keywords FOR DELETE USING (auth.uid() = user_id);
