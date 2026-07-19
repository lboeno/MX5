import { supabase } from "../../lib/supabase";
import type { ProfileWithPermissions } from "../../types/permissions";

export async function getAllUsersWithPermissions(): Promise<ProfileWithPermissions[]> {
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, email, role, phone, created_at")
    .order("created_at", { ascending: false });

  if (profileError) {
    console.error("[permissions] Erro ao buscar profiles:", profileError);
    throw profileError;
  }
  if (!profiles?.length) return [];

  const { data: rolePerms, error: roleError } = await supabase
    .from("role_permissions")
    .select("role, screens");

  if (roleError) throw roleError;

  const roleDefaults = Object.fromEntries(
    (rolePerms ?? []).map((r: { role: string; screens: Record<string, boolean> }) => [r.role, r.screens])
  );

  const userIds = profiles.map((p: { id: string }) => p.id);

  let userPerms: { user_id: string; screens: Record<string, boolean> }[] = [];
  if (userIds.length > 0) {
    const { data, error: userPermError } = await supabase
      .from("user_permissions")
      .select("user_id, screens")
      .in("user_id", userIds);

    if (userPermError) {
      console.error("[permissions] Erro ao buscar user_permissions:", userPermError);
      throw userPermError;
    }
    userPerms = data ?? [];
  }

  const userPermMap = Object.fromEntries(
    (userPerms ?? []).map((u: { user_id: string; screens: Record<string, boolean> }) => [u.user_id, u.screens])
  );

  return profiles.map((profile: { id: string; name: string; email: string; role: string; phone?: string; created_at: string }) => {
    const defaults = roleDefaults[profile.role] ?? {};
    const overrides = userPermMap[profile.id] ?? {};
    const merged = { ...defaults, ...overrides };
    const overrideCount = Object.keys(overrides).filter(
      (screen) => overrides[screen] !== defaults[screen]
    ).length;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      phone: profile.phone,
      created_at: profile.created_at,
      permissions: merged,
      overrideCount,
    };
  });
}

export async function getUserPermissions(userId: string): Promise<{ role: string; defaults: Record<string, boolean>; overrides: Record<string, boolean> }> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const { data: rolePerm, error: roleError } = await supabase
    .from("role_permissions")
    .select("screens")
    .eq("role", profile.role)
    .single();

  if (roleError) throw roleError;

  const { data: userPerm, error: userError } = await supabase
    .from("user_permissions")
    .select("screens")
    .eq("user_id", userId)
    .maybeSingle();

  if (userError) throw userError;

  return {
    role: profile.role,
    defaults: rolePerm.screens as Record<string, boolean>,
    overrides: (userPerm?.screens ?? {}) as Record<string, boolean>,
  };
}

export async function setUserPermission(
  userId: string,
  screens: Record<string, boolean>
): Promise<void> {
  const { error } = await supabase
    .from("user_permissions")
    .upsert(
      { user_id: userId, screens, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) throw error;
}

export async function resetUserPermissions(userId: string): Promise<void> {
  const { error } = await supabase
    .from("user_permissions")
    .upsert(
      { user_id: userId, screens: {}, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) throw error;
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc("delete_user_account", { target_user_id: userId });
  if (error) throw error;
}

export async function getGroupPermissions(): Promise<Record<string, Record<string, boolean>>> {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("role, screens")
    .order("role");

  if (error) throw error;

  const result: Record<string, Record<string, boolean>> = {};
  for (const row of data ?? []) {
    result[row.role] = row.screens as Record<string, boolean>;
  }
  return result;
}

export async function setGroupPermissions(role: string, screens: Record<string, boolean>): Promise<void> {
  const { error } = await supabase.rpc("set_role_permissions", {
    p_role: role,
    p_screens: screens,
  });
  if (error) throw error;
}

export async function resolveScreenAccess(userId: string, screen: string): Promise<boolean> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const { data: rolePerm, error: roleError } = await supabase
    .from("role_permissions")
    .select("screens")
    .eq("role", profile.role)
    .single();

  if (roleError) throw roleError;

  const defaults = rolePerm.screens as Record<string, boolean>;
  const defaultValue = defaults[screen] ?? false;

  const { data: userPerm, error: userError } = await supabase
    .from("user_permissions")
    .select("screens")
    .eq("user_id", userId)
    .maybeSingle();

  if (userError) throw userError;

  if (userPerm?.screens && screen in (userPerm.screens as Record<string, boolean>)) {
    return (userPerm.screens as Record<string, boolean>)[screen];
  }

  return defaultValue;
}
