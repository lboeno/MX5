-- Extend pilots/profiles schema, fix staff access helpers, backfill pilot records
-- 2026-07-18

-- 1. Profiles: optional avatar
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Pilots: fields expected by the app
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Brasil';
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS motorcycle_brand TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS motorcycle_model TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS motorcycle_year INTEGER;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS motorcycle_engine_cc TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS motorcycle_color TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS motorcycle_chassis TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS ranking INTEGER DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS podiums INTEGER DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS dnf INTEGER DEFAULT 0;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS sponsors TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS emergency_name TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS emergency_phone TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS emergency_relation TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Documents can belong to a pilot profile (signup) or an event registration
ALTER TABLE registration_documents ADD COLUMN IF NOT EXISTS pilot_id UUID REFERENCES pilots(id) ON DELETE CASCADE;
ALTER TABLE registration_documents ALTER COLUMN registration_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reg_docs_pilot ON registration_documents(pilot_id);

-- 4. Harden helper functions used by RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'organizer')
  );
$$;

-- 5. Profiles: staff can list all users for admin screens
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_staff());

-- 6. Pilots: allow new pilots to create their own record during signup
DROP POLICY IF EXISTS "pilots_insert_own" ON pilots;
CREATE POLICY "pilots_insert_own" ON pilots
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- 7. Documents linked directly to pilot profile (signup flow)
DROP POLICY IF EXISTS "insert_own_registration_docs" ON registration_documents;
CREATE POLICY "insert_own_registration_docs" ON registration_documents
  FOR INSERT
  WITH CHECK (
    (
      registration_id IS NOT NULL
      AND auth.uid() IN (
        SELECT pilots.profile_id
        FROM pilot_registrations
        JOIN pilots ON pilots.id = pilot_registrations.pilot_id
        WHERE pilot_registrations.id = registration_id
      )
    )
    OR (
      pilot_id IS NOT NULL
      AND auth.uid() IN (
        SELECT profile_id FROM pilots WHERE id = pilot_id
      )
    )
  );

DROP POLICY IF EXISTS "select_own_or_admin_docs" ON registration_documents;
CREATE POLICY "select_own_or_admin_docs" ON registration_documents
  FOR SELECT
  USING (
    is_admin()
    OR (
      registration_id IS NOT NULL
      AND auth.uid() IN (
        SELECT pilots.profile_id
        FROM pilot_registrations
        JOIN pilots ON pilots.id = pilot_registrations.pilot_id
        WHERE pilot_registrations.id = registration_id
      )
    )
    OR (
      pilot_id IS NOT NULL
      AND auth.uid() IN (
        SELECT profile_id FROM pilots WHERE id = pilot_id
      )
    )
  );

-- 8. Backfill competitive profiles for existing pilot accounts
INSERT INTO pilots (profile_id, name, status)
SELECT id, name, 'active'
FROM profiles
WHERE role = 'pilot'
ON CONFLICT (profile_id) DO UPDATE
SET name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = now();
