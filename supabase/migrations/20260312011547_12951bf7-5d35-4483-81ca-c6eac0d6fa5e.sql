
-- Admin can delete profiles
CREATE POLICY "Admin can delete profiles" ON public.profiles
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete tournament registrations
CREATE POLICY "Admin can delete tournament registrations" ON public.tournament_registrations
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
