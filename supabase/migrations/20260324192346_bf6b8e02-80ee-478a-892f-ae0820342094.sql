
-- Site config for admin-editable homepage content
CREATE TABLE public.site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site config viewable by everyone" ON public.site_config FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage site config" ON public.site_config FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Add prize and sponsor_tag columns to tournament_champions
ALTER TABLE public.tournament_champions ADD COLUMN IF NOT EXISTS prize text DEFAULT '';
ALTER TABLE public.tournament_champions ADD COLUMN IF NOT EXISTS sponsor_tag text DEFAULT 'Comunitario';

-- Insert default site config values
INSERT INTO public.site_config (key, value) VALUES
  ('hero_stats', '{"prizes_delivered": "$500+ USD en premios", "staff_members": 5}'::jsonb),
  ('staff', '[]'::jsonb),
  ('discord_link', '"https://discord.gg"'::jsonb)
ON CONFLICT (key) DO NOTHING;
