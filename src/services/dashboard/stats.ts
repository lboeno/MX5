import { supabase } from "../../lib/supabase";
import type { DashboardStats } from "../../types/dashboard";

function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

function throwIfError(label: string, error: { message: string } | null) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

export async function getStats(): Promise<DashboardStats> {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const [
    totalPilotsResult,
    activeEventsResult,
    totalRegistrationsResult,
    pendingResult,
    revenueTotalResult,
    revenueCurrentResult,
    revenuePreviousResult,
    pilotsCurrentResult,
    pilotsPreviousResult,
    registrationsCurrentResult,
    registrationsPreviousResult,
    conversionResult,
    avgTimeResult,
  ] = await Promise.all([
    supabase.from("pilots").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("events").select("*", { count: "exact", head: true }).in("event_status", ["upcoming", "registration_open", "running"]),
    supabase.from("pilot_registrations").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("id, amount").eq("status", "pending"),
    supabase.from("payments").select("amount").eq("status", "paid"),
    supabase.from("payments").select("amount").eq("status", "paid").gte("paid_at", currentMonthStart),
    supabase.from("payments").select("amount").eq("status", "paid").gte("paid_at", prevMonthStart).lt("paid_at", currentMonthStart),
    supabase.from("pilots").select("id", { count: "exact", head: true }).eq("status", "active").gte("created_at", currentMonthStart),
    supabase.from("pilots").select("id", { count: "exact", head: true }).eq("status", "active").gte("created_at", prevMonthStart).lt("created_at", currentMonthStart),
    supabase.from("pilot_registrations").select("id", { count: "exact", head: true }).gte("created_at", currentMonthStart),
    supabase.from("pilot_registrations").select("id", { count: "exact", head: true }).gte("created_at", prevMonthStart).lt("created_at", currentMonthStart),
    supabase.from("pilot_registrations").select("id, status"),
    supabase.from("pilot_registrations").select("created_at, confirmed_at"),
  ]);

  [
    ["pilotos ativos", totalPilotsResult.error],
    ["eventos ativos", activeEventsResult.error],
    ["inscricoes", totalRegistrationsResult.error],
    ["pagamentos pendentes", pendingResult.error],
    ["receita total", revenueTotalResult.error],
    ["receita atual", revenueCurrentResult.error],
    ["receita anterior", revenuePreviousResult.error],
    ["pilotos do mes", pilotsCurrentResult.error],
    ["pilotos do mes anterior", pilotsPreviousResult.error],
    ["inscricoes do mes", registrationsCurrentResult.error],
    ["inscricoes do mes anterior", registrationsPreviousResult.error],
    ["conversao", conversionResult.error],
    ["tempo medio", avgTimeResult.error],
  ].forEach(([label, error]) => throwIfError(label as string, error as { message: string } | null));

  const totalRevenue = ((revenueTotalResult.data as { amount: number }[]) ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const currentRevenue = ((revenueCurrentResult.data as { amount: number }[]) ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const prevRevenue = ((revenuePreviousResult.data as { amount: number }[]) ?? []).reduce((s, r) => s + Number(r.amount), 0);

  const pendingData = pendingResult.data ?? [];
  const pendingAmount = pendingData.reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0);

  const conversionData = conversionResult.data ?? [];
  const confirmedCount = conversionData.filter((r: { status: string }) => r.status === "confirmed").length;
  const totalCount = conversionData.length;
  const conversionRate = totalCount > 0 ? Math.round((confirmedCount / totalCount) * 1000) / 10 : 0;

  const avgTimeData = avgTimeResult.data ?? [];
  const confirmedItems = (avgTimeData ?? []).filter((r: { created_at: string; confirmed_at: string | null }) => r.confirmed_at);
  const totalDays = confirmedItems.reduce((sum: number, r: { created_at: string; confirmed_at: string }) => {
    const diff = new Date(r.confirmed_at).getTime() - new Date(r.created_at).getTime();
    return sum + diff / (1000 * 60 * 60 * 24);
  }, 0);
  const avgRegistrationDays = confirmedItems.length > 0 ? Math.round((totalDays / confirmedItems.length) * 10) / 10 : 0;

  return {
    totalRevenue,
    activePilots: totalPilotsResult.count ?? 0,
    activeEvents: activeEventsResult.count ?? 0,
    totalRegistrations: totalRegistrationsResult.count ?? 0,
    pendingPayments: (pendingData ?? []).length,
    pendingAmount,
    revenueChange: calcChange(currentRevenue, prevRevenue),
    pilotsChange: calcChange(pilotsCurrentResult.count ?? 0, pilotsPreviousResult.count ?? 0),
    registrationsChange: calcChange(registrationsCurrentResult.count ?? 0, registrationsPreviousResult.count ?? 0),
    conversionRate,
    avgRegistrationDays,
  };
}
