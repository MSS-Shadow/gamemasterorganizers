
-- Scrims table
CREATE TABLE public.scrims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  mode text NOT NULL,
  date timestamp with time zone NOT NULL,
  stream_link text,
  status text NOT NULL DEFAULT 'upcoming',
  max_players integer NOT NULL DEFAULT 120,
  created_by uuid NOT NULL,
  creator_nickname text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scrims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scrims viewable by everyone" ON public.scrims
FOR SELECT TO public USING (true);

CREATE POLICY "Admins and creators can manage scrims" ON public.scrims
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'content_creator'::app_role));

-- Scrim participants table
CREATE TABLE public.scrim_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scrim_id uuid NOT NULL REFERENCES public.scrims(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  nickname text NOT NULL,
  player_id text NOT NULL,
  team text NOT NULL,
  platform text NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(scrim_id, user_id)
);

ALTER TABLE public.scrim_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scrim participants viewable by everyone" ON public.scrim_participants
FOR SELECT TO public USING (true);

CREATE POLICY "Users can join scrims" ON public.scrim_participants
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave scrims" ON public.scrim_participants
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage scrim participants" ON public.scrim_participants
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Creator requests table
CREATE TABLE public.creator_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nickname text NOT NULL,
  email text NOT NULL,
  platform text NOT NULL,
  channel_link text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone
);

ALTER TABLE public.creator_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creator requests viewable by admins" ON public.creator_requests
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id);

CREATE POLICY "Users can request creator access" ON public.creator_requests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update creator requests" ON public.creator_requests
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete creator requests" ON public.creator_requests
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
