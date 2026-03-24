
-- Add image_url to tournaments for evidence photos
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';

-- Add image_url to tournament_champions for winner evidence
ALTER TABLE public.tournament_champions ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';

-- Add region to tournaments for LATAM/BR filtering
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS region text DEFAULT 'LATAM';
