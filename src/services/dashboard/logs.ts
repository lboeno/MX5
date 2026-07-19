import { supabase } from "../../lib/supabase";
import type { DashboardLog } from "../../types/dashboard";

export async function getRecentLogs(limit = 10): Promise<DashboardLog[]> {
  const { data, error } = await supabase
    .from("system_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data) return [];

  const userIds = [...new Set(data.map((l) => l.user_id).filter(Boolean))];
  let userMap = new Map<string, string>();

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);

    if (profilesError) throw profilesError;
    if (profiles) {
      for (const p of profiles) {
        userMap.set(p.id, p.name);
      }
    }
  }

  return data.map((l) => ({
    id: l.id,
    userName: userMap.get(l.user_id) ?? "Sistema",
    action: l.action,
    entity: l.entity,
    entityId: l.entity_id ?? undefined,
    details: typeof l.details === "object" ? l.details?.message ?? JSON.stringify(l.details) : String(l.details ?? ""),
    level: l.level,
    createdAt: l.created_at,
  }));
}

export async function getAllLogs(): Promise<DashboardLog[]> {
  return getRecentLogs(1000);
}
