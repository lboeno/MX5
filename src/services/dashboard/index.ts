import type { DashboardData } from "../../types/dashboard";
import { getStats } from "./stats";
import { getRevenueChart, getRegistrationChart } from "./charts";
import { getRecentPayments } from "./payments";
import { getRecentLogs } from "./logs";

export async function getDashboardData(): Promise<DashboardData> {
  const [stats, revenueChart, registrationChart, recentPayments, recentLogs] = await Promise.all([
    getStats(),
    getRevenueChart(),
    getRegistrationChart(),
    getRecentPayments(5),
    getRecentLogs(5),
  ]);

  const allMonths = new Map<string, { revenue: number; registrations: number }>();

  for (const m of revenueChart) {
    allMonths.set(m.month, { revenue: m.revenue, registrations: 0 });
  }
  for (const m of registrationChart) {
    const existing = allMonths.get(m.month);
    if (existing) {
      existing.registrations = m.registrations;
    } else {
      allMonths.set(m.month, { revenue: 0, registrations: m.registrations });
    }
  }

  const charts = Array.from(allMonths.entries())
    .sort(([a], [b]) => {
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return months.indexOf(a) - months.indexOf(b);
    })
    .map(([month, val]) => ({ month, ...val }));

  return {
    stats,
    charts,
    recentPayments,
    recentLogs,
  };
}
