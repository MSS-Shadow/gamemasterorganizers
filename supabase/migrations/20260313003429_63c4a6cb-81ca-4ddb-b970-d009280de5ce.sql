
-- Add status column to profiles
ALTER TABLE public.profiles ADD COLUMN status text NOT NULL DEFAULT 'active';

-- Create moderation_logs table
CREATE TABLE public.moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  admin_nickname text NOT NULL,
  target_user_id uuid,
  target_nickname text NOT NULL,
  action text NOT NULL,
  reason text NOT NULL,
  detail text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Everyone can read moderation logs (admins need this)
CREATE POLICY "Admins can read moderation logs" ON public.moderation_logs
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert moderation logs
CREATE POLICY "Admins can insert moderation logs" ON public.moderation_logs
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can update profiles (for status changes)
CREATE POLICY "Admin can update all profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
