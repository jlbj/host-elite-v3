-- MDX Editor Migration
-- Run this in Supabase SQL Editor: https://dcaarwmafbrqdmwbulpt.supabase.co/project/sql

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS mdx_content TEXT;

COMMENT ON COLUMN public.properties.mdx_content IS 'MDX content for custom website/microsite layouts';

-- Done! The MDX Editor will now work.
-- Access it from the sidebar: Management → MDX Editor