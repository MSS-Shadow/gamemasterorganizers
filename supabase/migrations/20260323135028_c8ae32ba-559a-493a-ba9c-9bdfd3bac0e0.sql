
-- Tournament Scoring Configuration
CREATE TABLE public.tournament_scoring_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  kill_value NUMERIC NOT NULL DEFAULT 1,
  position_values JSONB NOT NULL DEFAULT '{}',
  kill_multiplier_by_position JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id)
);

ALTER TABLE public.tournament_scoring_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scoring config" ON public.tournament_scoring_config FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Scoring config viewable by everyone" ON public.tournament_scoring_config FOR SELECT TO public USING (true);

-- Tournament Results (per team scores)
CREATE TABLE public.tournament_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  kills INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  kill_points NUMERIC NOT NULL DEFAULT 0,
  position_points NUMERIC NOT NULL DEFAULT 0,
  multiplier_bonus NUMERIC NOT NULL DEFAULT 0,
  total_points NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage results" ON public.tournament_results FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Results viewable by everyone" ON public.tournament_results FOR SELECT TO public USING (true);

-- Announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Announcements viewable by everyone" ON public.announcements FOR SELECT TO public USING (true);

-- Reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_user_id UUID NOT NULL,
  reporter_nickname TEXT NOT NULL,
  reported_player TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id);
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete reports" ON public.reports FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Verification Requests
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nickname TEXT NOT NULL,
  player_id TEXT NOT NULL,
  email TEXT NOT NULL,
  profile_screenshot_url TEXT,
  id_screenshot_url TEXT,
  additional_doc_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit verification" ON public.verification_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own verification" ON public.verification_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update verification" ON public.verification_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete verification" ON public.verification_requests FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES ('uploads', 'uploads', true, 5242880);

-- Storage policies
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT TO public USING (bucket_id = 'uploads');
CREATE POLICY "Admins can delete uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for announcements
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
