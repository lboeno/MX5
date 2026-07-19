import { supabase } from "../../lib/supabase";
import type { DashboardPayment } from "../../types/dashboard";

export async function getRecentPayments(limit = 10): Promise<DashboardPayment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      status,
      method,
      provider_payment_id,
      paid_at,
      created_at,
      pilot_id,
      event_id
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data) return [];

  const pilotIds = [...new Set(data.map((p) => p.pilot_id).filter(Boolean))];

  let pilotMap = new Map<string, { name: string; category?: string }>();
  if (pilotIds.length > 0) {
    const { data: pilots, error: pilotsError } = await supabase
      .from("pilots")
      .select("id, name, categories(name)")
      .in("id", pilotIds);

    if (pilotsError) throw pilotsError;
    if (pilots) {
      for (const p of pilots) {
        pilotMap.set(p.id, { name: p.name, category: (p.categories as any)?.name });
      }
    }
  }

  const eventIds = [...new Set(data.map((p) => p.event_id).filter(Boolean))];
  let eventMap = new Map<string, string>();
  if (eventIds.length > 0) {
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title")
      .in("id", eventIds);

    if (eventsError) throw eventsError;
    if (events) {
      for (const e of events) {
        eventMap.set(e.id, e.title);
      }
    }
  }

  return data.map((p) => {
    const pilotInfo = pilotMap.get(p.pilot_id);
    return {
      id: p.id,
      pilotId: p.pilot_id ?? "",
      pilotName: pilotInfo?.name ?? "—",
      eventName: eventMap.get(p.event_id) ?? "—",
      amount: Number(p.amount),
      status: p.status,
      method: p.method ?? "",
      category: pilotInfo?.category,
      transactionId: p.provider_payment_id,
      createdAt: p.created_at,
      paidAt: p.paid_at,
    };
  });
}

export async function getAllPayments(): Promise<DashboardPayment[]> {
  return getRecentPayments(1000);
}
