-- Migration: Create events domain (events + event_categories + event_schedule + event_sponsors)
-- 2026-07-18

-- 1. Events
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  championship_id UUID,
  track_id UUID,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  cover_image TEXT,
  banner_image TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  registration_open TIMESTAMPTZ,
  registration_close TIMESTAMPTZ,
  entry_fee DECIMAL(10,2) CHECK (entry_fee >= 0),
  max_pilots INTEGER CHECK (max_pilots > 0),
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  event_status TEXT NOT NULL DEFAULT 'upcoming' CHECK (event_status IN ('upcoming', 'registration_open', 'running', 'finished', 'cancelled')),
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_pub_status ON events(publication_status) WHERE publication_status = 'published';
CREATE INDEX idx_events_event_status ON events(event_status);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_featured ON events(is_featured) WHERE is_featured = true;
CREATE INDEX idx_events_championship ON events(championship_id);
CREATE INDEX idx_events_track ON events(track_id);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_events" ON events
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "published_select_events" ON events
  FOR SELECT
  USING (publication_status = 'published' AND deleted_at IS NULL);

-- 2. Event Categories (N:N)
CREATE TABLE event_categories (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL,
  PRIMARY KEY (event_id, category_id)
);

CREATE INDEX idx_event_cat_event ON event_categories(event_id);
CREATE INDEX idx_event_cat_category ON event_categories(category_id);

ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_event_categories" ON event_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "select_event_categories" ON event_categories
  FOR SELECT USING (true);

-- 3. Event Schedule
CREATE TABLE event_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1),
  start_time TIME NOT NULL,
  end_time TIME,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('practice', 'qualifying', 'race', 'ceremony', 'break', 'other'))
);

CREATE INDEX idx_event_schedule_event ON event_schedule(event_id);
CREATE INDEX idx_event_schedule_day ON event_schedule(event_id, day);

ALTER TABLE event_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_event_schedule" ON event_schedule
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "select_event_schedule" ON event_schedule
  FOR SELECT USING (true);

-- 4. Event Sponsors
CREATE TABLE event_sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo TEXT,
  website TEXT,
  tier TEXT CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze', 'media'))
);

CREATE INDEX idx_event_sponsors_event ON event_sponsors(event_id);

ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_event_sponsors" ON event_sponsors
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "select_event_sponsors" ON event_sponsors
  FOR SELECT USING (true);

-- FK from pilot_registrations to events (table created in 000_core_schema)
ALTER TABLE pilot_registrations ADD CONSTRAINT fk_pilot_reg_event
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
