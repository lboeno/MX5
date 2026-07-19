-- Migration: Create categories master table
-- 2026-07-18

CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_categories" ON categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "select_categories" ON categories
  FOR SELECT USING (true);

-- Seed data
INSERT INTO categories (id, name, slug) VALUES
  (gen_random_uuid(), 'MX1', 'mx1'),
  (gen_random_uuid(), 'MX2', 'mx2'),
  (gen_random_uuid(), 'MX3', 'mx3'),
  (gen_random_uuid(), 'MXF', 'mxf'),
  (gen_random_uuid(), 'MX VET', 'mx-vet'),
  (gen_random_uuid(), 'MX JR', 'mx-jr'),
  (gen_random_uuid(), 'MX MINI', 'mx-mini'),
  (gen_random_uuid(), 'ENDURO', 'enduro'),
  (gen_random_uuid(), 'TRAIL', 'trail');

-- Add FK from event_categories to categories
ALTER TABLE event_categories ADD CONSTRAINT fk_event_cat_category
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- Add FK from pilots to categories
ALTER TABLE pilots ADD CONSTRAINT fk_pilots_category
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
