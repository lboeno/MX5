import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, Users, Flag, FileText, CreditCard, Trophy, TrendingUp,
} from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { getDashboardData } from "../../services/dashboard";
import { getAllPayments } from "../../services/dashboard/payments";
import { fetchAllEvents } from "../../services/events";
import { getRankingsOverview } from "../../services/rankings";
import type { DashboardData } from "../../types/dashboard";
import type { DashboardPayment } from "../../types/dashboard";
import type { EventSummary } from "../../types/events";
import type { RankingsOverview } from "../../types/rankings";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const EV_STATUS_LABELS: Record<string, string> = {
  upcoming: "Em breve",
  registration_open: "Inscrições abertas",
  running: "Em andamento",
  finished: "Encerrado",
  cancelled: "Cancelado",
};

const EV_STATUS_VARIANTS: Record<string, "info" | "success" | "warning" | "default" | "danger" | "ghost"> = {
  upcoming: "info",
  registration_open: "success",
  running: "warning",
  finished: "default",
  cancelled: "danger",
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: "#22c55e",
  pending: "#eab308",
  refund: "#a855f7",
  refunded: "#a855f7",
  cancelled: "#ef4444",
  failed: "#ef4444",
};

const PAYMENT_LABELS: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  refund: "Reembolsado",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
  failed: "Falhou",
};

function brl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AdminAnalytics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [payments, setPayments] = useState<DashboardPayment[]>([]);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [overview, setOverview] = useState<RankingsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      getDashboardData(),
      getAllPayments(),
      fetchAllEvents({}),
      getRankingsOverview(),
    ])
      .then(([d, p, e, o]) => {
        if (!active) return;
        setData(d);
        setPayments(p);
        setEvents(e);
        setOverview(o);
      })
      .catch((err) => {
        console.error("[AdminAnalytics] Erro ao carregar:", err);
        setError("Não foi possível carregar os dados de analytics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Breakdown: pagamentos por status
  const paymentByStatus = payments.reduce<Record<string, { count: number; total: number }>>((acc, p) => {
    const key = p.status || "unknown";
    if (!acc[key]) acc[key] = { count: 0, total: 0 };
    acc[key].count += 1;
    acc[key].total += Number(p.amount) || 0;
    return acc;
  }, {});
  const paymentPie = Object.entries(paymentByStatus).map(([status, v]) => ({
    name: PAYMENT_LABELS[status] ?? status,
    value: v.total,
    count: v.count,
    color: PAYMENT_COLORS[status] ?? "#71717a",
  }));

  // Breakdown: eventos por status
  const eventByStatus = events.reduce<Record<string, number>>((acc, e) => {
    const k = e.eventStatus || "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  // Breakdown: eventos por UF
  const eventByState = events.reduce<Record<string, number>>((acc, e) => {
    const k = e.state || "—";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const stateBars = Object.entries(eventByState)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (loading) {
    return <div className="p-6 text-muted-foreground text-sm">Carregando analytics...</div>;
  }

  const stats = data?.stats;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Indicadores e breakdowns da plataforma</p>
      </div>

      {error && (
        <div className="rounded-[6px] border border-rose-900/60 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Receita Total" value={brl(stats?.totalRevenue ?? 0)} change={stats?.revenueChange} prefix="" icon={<DollarSign className="w-4 h-4" />} loading={loading} />
        <StatCard label="Pilotos Ativos" value={stats?.activePilots ?? 0} change={stats?.pilotsChange} icon={<Users className="w-4 h-4" />} loading={loading} />
        <StatCard label="Eventos Ativos" value={stats?.activeEvents ?? 0} icon={<Flag className="w-4 h-4" />} loading={loading} />
        <StatCard label="Inscrições" value={stats?.totalRegistrations ?? 0} change={stats?.registrationsChange} icon={<FileText className="w-4 h-4" />} loading={loading} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pagamentos Pendentes" value={stats?.pendingPayments ?? 0} icon={<CreditCard className="w-4 h-4" />} suffix={`· ${brl(stats?.pendingAmount ?? 0)}`} loading={loading} />
        <StatCard label="Taxa de Conversão" value={`${((stats?.conversionRate ?? 0) * 100).toFixed(1)}%`} icon={<TrendingUp className="w-4 h-4" />} loading={loading} />
        <StatCard label="Categorias" value={overview?.totalCategories ?? 0} icon={<Flag className="w-4 h-4" />} loading={loading} />
        <StatCard label="Líder do Ranking" value={overview?.leader?.name ?? "—"} icon={<Trophy className="w-4 h-4" />} suffix={overview?.leader ? `${overview.leader.points} pts` : ""} loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
            <CardDescription>Últimos meses</CardDescription>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 12 }}
                  formatter={(v: any) => brl(Number(v))}
                />
                <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inscrições Mensais</CardTitle>
            <CardDescription>Últimos meses</CardDescription>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 12 }}
                  formatter={(v: any) => Number(v)}
                />
                <Bar dataKey="registrations" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pagamentos por status */}
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos por Status</CardTitle>
            <CardDescription>Valor total por situação</CardDescription>
          </CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}>
                  {paymentPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa", fontSize: 12 }}
                  formatter={(v: any) => brl(Number(v))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            {paymentPie.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </span>
                <span className="text-foreground">{brl(p.value)} <span className="text-muted-foreground">({p.count})</span></span>
              </div>
            ))}
            {paymentPie.length === 0 && <p className="text-xs text-muted-foreground">Sem pagamentos.</p>}
          </div>
        </Card>

        {/* Eventos por status */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Status</CardTitle>
            <CardDescription>{events.length} eventos</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {Object.entries(eventByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <Badge variant={EV_STATUS_VARIANTS[status] ?? "ghost"} size="sm">
                  {EV_STATUS_LABELS[status] ?? status}
                </Badge>
                <span className="text-sm font-mono text-foreground">{count}</span>
              </div>
            ))}
            {events.length === 0 && <p className="text-xs text-muted-foreground">Sem eventos.</p>}
          </div>
        </Card>

        {/* Eventos por UF */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por UF</CardTitle>
            <CardDescription>Top estados</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {stateBars.map(([uf, count]) => (
              <div key={uf} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-8">{uf}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-rose-700 rounded-full" style={{ width: `${(count / (stateBars[0]?.[1] || 1)) * 100}%` }} />
                </div>
                <span className="text-xs font-mono text-foreground w-6 text-right">{count}</span>
              </div>
            ))}
            {stateBars.length === 0 && <p className="text-xs text-muted-foreground">Sem eventos.</p>}
          </div>
        </Card>
      </div>

      {/* Recent payments */}
      <Card padding="none" className="overflow-hidden">
        <CardHeader className="px-4 py-3">
          <CardTitle>Pagamentos Recentes</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Piloto</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden md:table-cell">Evento</th>
                <th className="text-right px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Valor</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden lg:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentPayments ?? []).map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{p.pilotName}</p>
                    {p.category && <p className="text-[11px] text-muted-foreground/70">{p.category}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{p.eventName}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-mono text-sm text-foreground">{brl(Number(p.amount))}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === "paid" ? "success" : p.status === "pending" ? "warning" : "danger"} size="sm">
                      {PAYMENT_LABELS[p.status] ?? p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs text-muted-foreground font-mono">
                      {format(new Date(p.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </td>
                </tr>
              ))}
              {(data?.recentPayments ?? []).length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">Nenhum pagamento recente.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
