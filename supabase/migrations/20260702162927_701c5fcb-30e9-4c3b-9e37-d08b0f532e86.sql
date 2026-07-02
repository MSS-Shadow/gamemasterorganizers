
-- SITE CONTENT (CMS)
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'text',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_content readable by all"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "site_content admin insert"
  ON public.site_content FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site_content admin update"
  ON public.site_content FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site_content admin delete"
  ON public.site_content FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_content (key, value, type) VALUES
  ('hero_title', 'Privadas para Mancos', 'text'),
  ('hero_subtitle', 'Lobbies Warzone LATAM sin tryhards', 'text'),
  ('hero_cta_text', 'Quiero jugar', 'text'),
  ('how_it_works_enabled', 'true', 'text'),
  ('how_step_1_title', 'Registrate', 'text'),
  ('how_step_1_desc', 'Creá tu cuenta en 2 minutos', 'text'),
  ('how_step_2_title', 'Verificamos tu KD', 'text'),
  ('how_step_2_desc', 'Nos aseguramos de que todos jugamos fair', 'text'),
  ('how_step_3_title', '¡A jugar!', 'text'),
  ('how_step_3_desc', 'Entrá a la privada y disfrutá sin sweats', 'text'),
  ('section_color', '#22c55e', 'color'),
  ('banner_image_url', '', 'image_url')
ON CONFLICT (key) DO NOTHING;

-- TOURNAMENT COMMENTS
CREATE TABLE IF NOT EXISTS public.tournament_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  comment text NOT NULL CHECK (char_length(comment) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tournament_comments TO anon;
GRANT SELECT, INSERT, DELETE ON public.tournament_comments TO authenticated;
GRANT ALL ON public.tournament_comments TO service_role;

ALTER TABLE public.tournament_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tournament_comments readable by all"
  ON public.tournament_comments FOR SELECT USING (true);

CREATE POLICY "tournament_comments insert own"
  ON public.tournament_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tournament_comments admin delete"
  ON public.tournament_comments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_tournament_comments_tid ON public.tournament_comments(tournament_id, created_at DESC);
