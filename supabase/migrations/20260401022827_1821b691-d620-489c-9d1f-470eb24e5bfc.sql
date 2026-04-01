
CREATE TABLE public.clan_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nickname TEXT NOT NULL,
  player_id TEXT NOT NULL,
  clan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clan_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own join requests" ON public.clan_join_requests FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can submit join requests" ON public.clan_join_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update join requests" ON public.clan_join_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete join requests" ON public.clan_join_requests FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clan leaders can view requests for their clan" ON public.clan_join_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.clans WHERE clans.name = clan_join_requests.clan_name AND clans.leader_user_id = auth.uid())
);
CREATE POLICY "Clan leaders can update requests for their clan" ON public.clan_join_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.clans WHERE clans.name = clan_join_requests.clan_name AND clans.leader_user_id = auth.uid())
);

ALTER TABLE public.profiles ADD COLUMN is_clan_leader BOOLEAN DEFAULT false;
