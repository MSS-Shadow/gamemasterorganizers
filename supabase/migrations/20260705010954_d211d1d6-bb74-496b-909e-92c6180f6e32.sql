DROP POLICY IF EXISTS "Admins can upload to site folder" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site folder" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can read uploads" ON storage.objects;

CREATE POLICY "Admins can upload to uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update uploads"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'uploads' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete uploads"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'uploads' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Public can read uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');