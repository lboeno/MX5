-- Migration: Gallery module (real backend)
-- Tabela gallery_photos + bucket de storage 'gallery'
-- Campos espelham GalleryPhoto (src/types/index.ts).

CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID,
  event_name TEXT,
  url TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  alt TEXT NOT NULL,
  photographer TEXT,
  taken_at TIMESTAMPTZ DEFAULT now(),
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_select" ON gallery_photos;
CREATE POLICY "gallery_select" ON gallery_photos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "gallery_admin" ON gallery_photos;
CREATE POLICY "gallery_admin" ON gallery_photos
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery_photos (featured);
CREATE INDEX IF NOT EXISTS idx_gallery_taken_at ON gallery_photos (taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_event_id ON gallery_photos (event_id);

-- Storage bucket 'gallery'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "admin_insert_gallery" ON storage.objects;
CREATE POLICY "admin_insert_gallery" ON storage.objects
  FOR INSERT
  WITH CHECK (is_admin() AND bucket_id = 'gallery');

DROP POLICY IF EXISTS "admin_update_gallery" ON storage.objects;
CREATE POLICY "admin_update_gallery" ON storage.objects
  FOR UPDATE
  USING (is_admin() AND bucket_id = 'gallery')
  WITH CHECK (is_admin() AND bucket_id = 'gallery');

DROP POLICY IF EXISTS "admin_delete_gallery" ON storage.objects;
CREATE POLICY "admin_delete_gallery" ON storage.objects
  FOR DELETE
  USING (is_admin() AND bucket_id = 'gallery');

DROP POLICY IF EXISTS "select_gallery" ON storage.objects;
CREATE POLICY "select_gallery" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery');
