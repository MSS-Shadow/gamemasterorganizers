
-- Add format column to tournaments
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'single_elimination';

-- Clans table
CREATE TABLE public.clans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  leader_user_id uuid NOT NULL,
  leader_nickname text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clans viewable by everyone" ON public.clans FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage clans" ON public.clans FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Leaders can update own clan" ON public.clans FOR UPDATE TO authenticated USING (auth.uid() = leader_user_id);
CREATE POLICY "System can insert clans" ON public.clans FOR INSERT TO authenticated WITH CHECK (true);

-- Clan members
CREATE TABLE public.clan_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  nickname text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(clan_id, user_id)
);
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clan members viewable by everyone" ON public.clan_members FOR SELECT TO public USING (true);
CREATE POLICY "Users can request to join" ON public.clan_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Leaders can manage members" ON public.clan_members FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.clans WHERE id = clan_id AND leader_user_id = auth.uid())
);
CREATE POLICY "Leaders can remove members" ON public.clan_members FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.clans WHERE id = clan_id AND leader_user_id = auth.uid()) OR auth.uid() = user_id
);
CREATE POLICY "Admins can manage all members" ON public.clan_members FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Clan leader requests
CREATE TABLE public.clan_leader_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nickname text NOT NULL,
  player_id text NOT NULL,
  clan_name text NOT NULL,
  email text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone
);
ALTER TABLE public.clan_leader_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own requests viewable" ON public.clan_leader_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can submit requests" ON public.clan_leader_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update requests" ON public.clan_leader_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete requests" ON public.clan_leader_requests FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Bracket matches
CREATE TABLE public.bracket_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round integer NOT NULL,
  match_number integer NOT NULL,
  team1_name text,
  team2_name text,
  winner_name text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, round, match_number)
);
ALTER TABLE public.bracket_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brackets viewable by everyone" ON public.bracket_matches FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage brackets" ON public.bracket_matches FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Tournament champions
CREATE TABLE public.tournament_champions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  mode text NOT NULL,
  tournament_name text NOT NULL,
  date timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.tournament_champions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Champions viewable by everyone" ON public.tournament_champions FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage champions" ON public.tournament_champions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Tournament waiting list
CREATE TABLE public.tournament_waiting_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  nickname text NOT NULL,
  player_id text NOT NULL,
  platform text NOT NULL,
  clan text NOT NULL DEFAULT '',
  tournament_team_name text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);
ALTER TABLE public.tournament_waiting_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Waiting list viewable by everyone" ON public.tournament_waiting_list FOR SELECT TO public USING (true);
CREATE POLICY "Users can join waiting list" ON public.tournament_waiting_list FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave waiting list" ON public.tournament_waiting_list FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage waiting list" ON public.tournament_waiting_list FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Add clan_leader role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'clan_leader';
