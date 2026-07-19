-- Migration: Create role_permissions and user_permissions tables
-- 2026-07-18

-- 1. Role Permissions (default per-role access)
CREATE TABLE role_permissions (
  role TEXT PRIMARY KEY CHECK (role IN ('admin', 'organizer', 'pilot', 'team')),
  screens JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User Permissions (individual overrides)
CREATE TABLE user_permissions (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  screens JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Auto-create empty user_permissions on profile insert
CREATE OR REPLACE FUNCTION public.handle_new_profile_permissions()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.user_permissions (user_id, screens)
  VALUES (NEW.id, '{}')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile_permissions();

-- 4. RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Everyone can read role_permissions
CREATE POLICY "role_permissions_select_all" ON role_permissions
  FOR SELECT USING (true);

-- Only admins can modify role_permissions
CREATE POLICY "role_permissions_insert_admin" ON role_permissions
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "role_permissions_update_admin" ON role_permissions
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "role_permissions_delete_admin" ON role_permissions
  FOR DELETE USING (is_admin());

-- Users can read their own user_permissions; admins can read all
CREATE POLICY "user_permissions_select_own" ON user_permissions
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- Only admins can modify user_permissions
CREATE POLICY "user_permissions_insert_admin" ON user_permissions
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "user_permissions_update_admin" ON user_permissions
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "user_permissions_delete_admin" ON user_permissions
  FOR DELETE USING (is_admin());

-- 5. Indexes
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);

-- 6. Seed default role permissions
INSERT INTO role_permissions (role, screens) VALUES
  ('admin', '{
    "admin.dashboard": true,
    "admin.analytics": true,
    "admin.configuracoes": true,
    "admin.eventos": true,
    "admin.pilotos": true,
    "admin.rankings": true,
    "admin.calendario": true,
    "admin.noticias": true,
    "admin.galeria": true,
    "admin.inscricoes": true,
    "admin.pagamentos": true,
    "admin.usuarios": true,
    "admin.logs": true
  }'),
  ('organizer', '{
    "admin.dashboard": true,
    "admin.analytics": false,
    "admin.configuracoes": false,
    "admin.eventos": true,
    "admin.pilotos": true,
    "admin.rankings": true,
    "admin.calendario": true,
    "admin.noticias": true,
    "admin.galeria": true,
    "admin.inscricoes": true,
    "admin.pagamentos": true,
    "admin.usuarios": false,
    "admin.logs": false
  }'),
  ('pilot', '{}'),
  ('team', '{}')
ON CONFLICT (role) DO UPDATE SET screens = EXCLUDED.screens;

-- 7. Create user_permissions for existing profiles that don't have one
INSERT INTO public.user_permissions (user_id, screens)
SELECT id, '{}' FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
