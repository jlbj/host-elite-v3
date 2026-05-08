-- Migration: Add mdx_content column to properties table
-- Description: Store MDX-based website content

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS mdx_content TEXT;

COMMENT ON COLUMN public.properties.mdx_content IS 'MDX content for custom website/microsite layouts';

-- Update existing properties with default content if needed
-- This is optional - existing properties will just have null mdx_content