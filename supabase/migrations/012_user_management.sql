-- Migration: User management (delete) + group permission management
-- 2026-07-18

-- 1. Allow admins to delete profiles (RLS)
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- 2. SECURITY DEFINER function to fully delete a user (profile + auth account)
-- Bypasses RLS by running as definer. Only admins may call it.
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir usuários';
  END IF;

  -- Remove profile (cascade removes user_permissions)
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Remove auth account
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- 3. Ensure role_permissions allows full upsert of group defaults by admins
-- (policies already restrict to is_admin(); add ON CONFLICT handling helper)
CREATE OR REPLACE FUNCTION public.set_role_permissions(
  p_role TEXT,
  p_screens JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar permissões de grupo';
  END IF;

  INSERT INTO public.role_permissions (role, screens, updated_at)
  VALUES (p_role, p_screens, now())
  ON CONFLICT (role) DO UPDATE SET screens = EXCLUDED.screens, updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_role_permissions(TEXT, JSONB) TO authenticated;
