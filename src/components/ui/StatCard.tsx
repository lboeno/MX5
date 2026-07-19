import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  iconColor?: string;
  loading?: boolean;
}

export function StatCard({ label, value, change, prefix, suffix, icon, iconColor = "text-rose-500", loading }: StatCardProps) {
  const trend = change !== undefined ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : null;

  if (loading) {
    return (
      <div className="bg-[#111113] border border-zinc-800/60 rounded-[8px] p-5">
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  return (
    <div className="bg-[#111113] border border-zinc-800/60 rounded-[8px] p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{label}</span>
        {icon && <span className={`w-4 h-4 ${iconColor}`}>{icon}</span>}
      </div>
      <div className="font-display font-bold text-2xl text-zinc-50 tracking-tight">
        {prefix && <span className="text-zinc-400 text-lg mr-1">{prefix}</span>}
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
        {suffix && <span className="text-zinc-400 text-base ml-1">{suffix}</span>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-mono ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-zinc-500"}`}>
          {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          <span>{change !== undefined ? Math.abs(change).toFixed(1) : "0"}% vs. mês anterior</span>
        </div>
      )}
    </div>
  );
}
