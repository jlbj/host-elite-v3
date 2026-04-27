-- Add property physical details fields
-- Supports OPS_12 "Saisie de Données de Propriété"

ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS rooms integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms numeric;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS surface_area numeric;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS max_guests integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bed_count integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS check_in_time text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS check_out_time text;