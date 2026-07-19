import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign, Users, Flag, FileText,
  CreditCard, Activity, Clock, AlertTriangle, CheckCircle,
  ArrowRight, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { getDashboardData } from "../../services/dashboard";
import type { DashboardData } from "../../types/dashboard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-zinc-700 rounded-[6px] px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono" style={{ color: p.color }}>
          {p.name === "revenue" ? `R$ ${p.value.toLocaleString("pt-BR")}` : `${p.value} inscrições`}
        </p>
      ))}
    </div>
  );
};

const PAYMENT_STATUS: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger" }> = {
  paid: { label: "Pago", variant: "success" },
  pending: { label: "Pendente", variant: "warning" },
  refund: { label: "Reembolso", variant: "info" },
  cancelled: { label: "Cancelado", variant: "danger" },
};

const LOG_LEVEL_STYLES: Record<string, string> = {
  info: "text-blue-400",
  warning: "text-amber-400",
  error: "text-rose-400",
  critical: "text-red-400",
};

export function AdminDashboard() {
  const [revenueView, setRevenueView] = useState<"area" | "bar">("area");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      console.error("[Dashboard] Erro ao carregar dados:", err);
      setData(null);
      setError(err instanceof Error ? err.message : "Falha ao carregar dados do backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = data?.stats;
  const charts = data?.charts ?? [];

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visão geral da plataforma · {loading ? "Carregando..." : "Atualizado agora há pouco"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={load}>Atualizar</Button>
          <Badge variant={error ? "danger" : "success"} dot>{error ? "Backend indisponivel" : "Sistema online"}</Badge>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-[6px] border border-rose-900/50 bg-rose-950/20 p-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-rose-300">Nao foi possivel carregar os dados do painel.</p>
            <p className="text-[11px] text-rose-500 font-mono mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Receita Total"
          value={stats?.totalRevenue ?? 0}
          change={stats?.revenueChange}
          prefix="R$"
          icon={<DollarSign className="w-4 h-4" />}
          iconColor="text-emerald-500"
          loading={loading}
        />
        <StatCard
          label="Pilotos Ativos"
          value={stats?.activePilots ?? 0}
          change={stats?.pilotsChange}
          icon={<Users className="w-4 h-4" />}
          iconColor="text-blue-500"
          loading={loading}
        />
        <StatCard
          label="Eventos Ativos"
          value={stats?.activeEvents ?? 0}
          change={0}
          icon={<Flag className="w-4 h-4" />}
          iconColor="text-rose-500"
          loading={loading}
        />
        <StatCard
          label="Inscrições"
          value={stats?.totalRegistrations ?? 0}
          change={stats?.registrationsChange}
          icon={<FileText className="w-4 h-4" />}
          iconColor="text-amber-500"
          loading={loading}
        />
      </div>

      {/* Alerts Row */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-[6px] border border-amber-900/50 bg-amber-950/20">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-300">{stats?.pendingPayments ?? 0} pagamentos pendentes</p>
            <p className="text-[11px] text-amber-700 font-mono">R$ {(stats?.pendingAmount ?? 0).toLocaleString("pt-BR")} em aberto</p>
          </div>
          <Link to="/admin/pagamentos" className="ml-auto">
            <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          </Link>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-[6px] border border-emerald-900/50 bg-emerald-950/20">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-emerald-300">Taxa de conversão</p>
            <p className="text-[11px] text-emerald-700 font-mono">{stats?.conversionRate ?? 0}% inscrições confirmadas</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-[6px] border border-blue-900/50 bg-blue-950/20">
          <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-300">Tempo médio de confirmação</p>
            <p className="text-[11px] text-blue-700 font-mono">{stats?.avgRegistrationDays ?? 0} dias</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            action={
              <div className="flex gap-1">
                {(["area", "bar"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setRevenueView(v)}
                    className={`px-2 py-1 text-[11px] rounded-[3px] transition-colors ${
                      revenueView === v ? "bg-zinc-700 text-foreground" : "text-muted-foreground/70 hover:text-muted-foreground"
                    }`}
                  >
                    {v === "area" ? "Área" : "Barras"}
                  </button>
                ))}
              </div>
            }
          >
            <CardTitle>Receita Mensal</CardTitle>
            <CardDescription>Faturamento</CardDescription>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            {revenueView === "area" ? (
              <AreaChart data={charts}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#e11d48" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#e11d48" }} />
              </AreaChart>
            ) : (
              <BarChart data={charts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="revenue" fill="#e11d48" radius={[2, 2, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inscrições por Mês</CardTitle>
            <CardDescription>Volume de inscrições</CardDescription>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="registrations" name="registrations" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Payments */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-sm text-foreground">Pagamentos Recentes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Últimas transações</p>
            </div>
            <Link to="/admin/pagamentos">
              <Button variant="ghost" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>Ver todos</Button>
            </Link>
          </div>
          <div>
            {(data?.recentPayments ?? []).map((payment) => {
              const st = PAYMENT_STATUS[payment.status] ?? { label: payment.status, variant: "ghost" as const };
              return (
                <div
                  key={payment.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{payment.pilotName}</p>
                    <p className="text-[11px] text-muted-foreground/70 font-mono truncate">{payment.eventName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm text-foreground">R$ {payment.amount}</p>
                    <Badge variant={st.variant} size="sm">{st.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* System Logs */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-sm text-foreground">Log do Sistema</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Atividades recentes</p>
            </div>
            <Link to="/admin/logs">
              <Button variant="ghost" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>Ver logs</Button>
            </Link>
          </div>
          <div>
            {(data?.recentLogs ?? []).map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3 border-b border-border/60 last:border-0">
                  <Activity className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${LOG_LEVEL_STYLES[log.level] ?? "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/80 truncate">{log.details}</p>
                    <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">
                    {log.userName} · {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <Badge
                  variant={log.level === "critical" ? "danger" : log.level === "warning" ? "warning" : log.level === "error" ? "danger" : "ghost"}
                  size="sm"
                >
                  {log.level}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
