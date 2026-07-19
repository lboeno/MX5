-- Core Domain Schema
-- 2026-07-18
-- Creates foundational entities: profiles, pilots, pilot_registrations

-- 0. Required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Profiles (must exist before functions that reference it)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'organizer', 'pilot', 'team')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Helper function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- 3. Profiles RLS policies (after is_admin exists)
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 4. Function: auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'pilot')
  );
  RETURN NEW;
END;
$$;

-- 5. Trigger: auto-create profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Pilots
CREATE TABLE pilots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  number TEXT,
  category_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pilots_profile ON pilots(profile_id);
CREATE INDEX idx_pilots_category ON pilots(category_id);

ALTER TABLE pilots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_pilots" ON pilots
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "pilots_select_own" ON pilots
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "pilots_update_own" ON pilots
  FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- 7. Pilot Registrations
CREATE TABLE pilot_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  event_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'waitlist')),
  UNIQUE (pilot_id, event_id),
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

CREATE INDEX idx_pilot_reg_pilot ON pilot_registrations(pilot_id);
CREATE INDEX idx_pilot_reg_event_status ON pilot_registrations(event_id, status);

ALTER TABLE pilot_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_pilot_registrations" ON pilot_registrations
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "pilots_select_own_registrations" ON pilot_registrations
  FOR SELECT USING (
    pilot_id IN (SELECT id FROM pilots WHERE profile_id = auth.uid())
  );

CREATE POLICY "pilots_insert_own_registrations" ON pilot_registrations
  FOR INSERT WITH CHECK (
    pilot_id IN (SELECT id FROM pilots WHERE profile_id = auth.uid())
  );
