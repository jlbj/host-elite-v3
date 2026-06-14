-- Create listing_templates table
CREATE TABLE IF NOT EXISTS public.listing_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    media TEXT,
    html TEXT NOT NULL,
    css TEXT,
    components TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.listing_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON public.listing_templates;
DROP POLICY IF EXISTS "Enable write for admin users only" ON public.listing_templates;

-- Policies
CREATE POLICY "Enable read for all authenticated users" ON public.listing_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write for admin users only" ON public.listing_templates
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );
