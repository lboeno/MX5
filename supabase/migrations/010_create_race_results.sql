-- Migration: Create race_results table for championship rankings
-- 2026-07-18

-- 1. Create race_results table
CREATE TABLE race_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  points NUMERIC(6,1) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'finished' CHECK (status IN ('finished', 'dnf', 'dns', 'dsq')),
  heat TEXT NOT NULL DEFAULT 'race' CHECK (heat IN ('qualifying', 'race', 'heat1', 'heat2', 'final')),
  best_lap TEXT,
  total_time TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Unique constraint: one result per pilot per event per category per heat
CREATE UNIQUE INDEX idx_race_results_unique ON race_results(pilot_id, event_id, category_id, heat);

-- 3. Indexes
CREATE INDEX idx_race_results_event ON race_results(event_id);
CREATE INDEX idx_race_results_pilot ON race_results(pilot_id);
CREATE INDEX idx_race_results_category ON race_results(category_id);
CREATE INDEX idx_race_results_event_category ON race_results(event_id, category_id);

-- 4. RLS
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "race_results_select_public" ON race_results
  FOR SELECT USING (true);

CREATE POLICY "race_results_insert_admin" ON race_results
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "race_results_update_admin" ON race_results
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "race_results_delete_admin" ON race_results
  FOR DELETE USING (is_admin());
