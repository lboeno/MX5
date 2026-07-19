-- Migration: Create event-images storage bucket
-- 2026-07-18

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Path pattern: {event_id}/{type}.{ext}
DROP POLICY IF EXISTS "admin_insert_event_images" ON storage.objects;
CREATE POLICY "admin_insert_event_images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    is_admin()
    AND bucket_id = 'event-images'
  );

DROP POLICY IF EXISTS "admin_update_event_images" ON storage.objects;
CREATE POLICY "admin_update_event_images" ON storage.objects
  FOR UPDATE
  USING (is_admin() AND bucket_id = 'event-images')
  WITH CHECK (is_admin() AND bucket_id = 'event-images');

DROP POLICY IF EXISTS "admin_delete_event_images" ON storage.objects;
CREATE POLICY "admin_delete_event_images" ON storage.objects
  FOR DELETE
  USING (is_admin() AND bucket_id = 'event-images');

DROP POLICY IF EXISTS "select_event_images" ON storage.objects;
CREATE POLICY "select_event_images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event-images');
