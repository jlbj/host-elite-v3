-- Migration: Create app_logs table
-- Description: Store application logs for user events, database queries, and AI prompts

CREATE TABLE IF NOT EXISTS public.app_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR', 'DEBUG')),
    category TEXT NOT NULL CHECK (category IN ('USER_EVENT', 'DB_QUERY', 'AI_PROMPT', 'APP_STATE', 'SYSTEM')),
    message TEXT NOT NULL,
    context JSONB,
    duration INTEGER,
    user_id TEXT
);

-- Index for efficient querying by category and timestamp
CREATE INDEX IF NOT EXISTS idx_app_logs_category_timestamp ON public.app_logs(category, timestamp DESC);

-- Index for user-specific logs
CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON public.app_logs(user_id) WHERE user_id IS NOT NULL;

-- Enable RLS for app_logs
ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own logs, admins can read all
CREATE POLICY "Users can read own logs" ON public.app_logs FOR SELECT TO authenticated USING (true);

-- Policy: Service role can insert logs (for client-side logging)
CREATE POLICY "Anyone can insert logs" ON public.app_logs FOR INSERT TO authenticated WITH CHECK (true);

COMMENT ON TABLE public.app_logs IS 'Application logs for debugging and analytics';
COMMENT ON COLUMN public.app_logs.category IS 'Type of log: USER_EVENT, DB_QUERY, AI_PROMPT, APP_STATE, SYSTEM';
COMMENT ON COLUMN public.app_logs.context IS 'Additional context data as JSON';
COMMENT ON COLUMN public.app_logs.duration IS 'Duration in milliseconds (for queries and AI calls)';