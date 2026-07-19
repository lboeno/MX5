import { supabase } from "../../lib/supabase";
import type { MonthlyChartData } from "../../types/dashboard";

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export async function getRevenueChart(): Promise<MonthlyChartData[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("amount, paid_at")
    .eq("status", "paid")
    .gte("paid_at", "2025-01-01")
    .not("paid_at", "is", null);

  if (error) throw error;
  return aggregateMonthly(data as { amount: number; paid_at: string }[] ?? [], "revenue");
}

export async function getRegistrationChart(): Promise<MonthlyChartData[]> {
  const { data, error } = await supabase
    .from("pilot_registrations")
    .select("created_at")
    .gte("created_at", "2025-01-01");

  if (error) throw error;
  return aggregateMonthly(data as { created_at: string }[] ?? [], "registrations");
}

function aggregateMonthly(
  items: { amount?: number; [key: string]: unknown }[],
  valueKey: "revenue" | "registrations"
): MonthlyChartData[] {
  const map = new Map<string, { revenue: number; registrations: number }>();

  for (const item of items) {
    const date = item.paid_at || item.created_at;
    if (!date) continue;
    const d = new Date(date as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!map.has(key)) {
      map.set(key, { revenue: 0, registrations: 0 });
    }

    const entry = map.get(key)!;
    if (valueKey === "revenue") {
      entry.revenue += Number(item.amount ?? 0);
    } else {
      entry.registrations += 1;
    }
  }

  const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));

  return sorted.map(([key, val]) => {
    const [, monthNum] = key.split("-");
    return {
      month: MONTH_NAMES[parseInt(monthNum, 10) - 1] || key,
      revenue: val.revenue,
      registrations: val.registrations,
    };
  });
}
