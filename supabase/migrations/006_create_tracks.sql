-- Migration: Create tracks table
-- 2026-07-18

CREATE TABLE tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  website TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_tracks" ON tracks
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "select_tracks" ON tracks
  FOR SELECT USING (true);

-- Add FK from events to tracks
ALTER TABLE events ADD CONSTRAINT fk_events_track
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE SET NULL;
