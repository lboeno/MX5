import { supabase } from "../lib/supabase";
import type { AppNotification, CreateNotificationInput } from "../types/notifications";

function mapRow(row: any): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body ?? null,
    link: row.link ?? null,
    read: row.read ?? false,
    level: (row.level ?? "info") as AppNotification["level"],
    createdAt: row.created_at,
  };
}

export async function fetchNotifications(userId: string, limit = 20): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
  return count ?? 0;
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}

export async function createNotification(input: CreateNotificationInput): Promise<AppNotification> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.userId,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      level: input.level ?? "info",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export function subscribeNotifications(
  userId: string,
  onInsert: (n: AppNotification) => void
): { unsubscribe: () => void } {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload: any) => {
        onInsert(mapRow(payload.new));
      }
    )
    .subscribe();
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
