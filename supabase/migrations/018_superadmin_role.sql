-- Migration: add superadmin role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['superadmin'::text, 'admin'::text, 'organizer'::text, 'pilot'::text, 'team'::text]));

ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_check;
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_role_check
  CHECK (role = ANY (ARRAY['superadmin'::text, 'admin'::text, 'organizer'::text, 'pilot'::text, 'team'::text]));

INSERT INTO role_permissions (role, screens)
SELECT 'superadmin', jsonb_object_agg(key, true)
FROM jsonb_each(
  COALESCE(
    (SELECT screens FROM role_permissions WHERE role = 'admin' LIMIT 1),
    '{}'::jsonb
  )
)
ON CONFLICT (role) DO NOTHING;
