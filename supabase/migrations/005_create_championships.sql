-- Migration: Create championships table
-- 2026-07-18

CREATE TABLE championships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  organization TEXT,
  season TEXT NOT NULL,
  logo TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_championships_slug ON championships(slug);

ALTER TABLE championships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_championships" ON championships
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "select_championships" ON championships
  FOR SELECT USING (true);

-- Add FK from events to championships
ALTER TABLE events ADD CONSTRAINT fk_events_championship
  FOREIGN KEY (championship_id) REFERENCES championships(id) ON DELETE SET NULL;
