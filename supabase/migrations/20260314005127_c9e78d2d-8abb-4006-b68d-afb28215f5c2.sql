
-- Fix permissive insert policy on clans - restrict to admins and approved clan leaders
DROP POLICY IF EXISTS "System can insert clans" ON public.clans;
CREATE POLICY "Authenticated users can insert clans" ON public.clans FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'clan_leader'::app_role) OR auth.uid() = leader_user_id);
