import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Download, RefreshCw, CreditCard, DollarSign,
  CheckCircle, Clock, XCircle, RotateCcw,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { getAllPayments } from "../../services/dashboard/payments";
import type { DashboardPayment } from "../../types/dashboard";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger"; icon: typeof CheckCircle }> = {
  paid: { label: "Pago", variant: "success", icon: CheckCircle },
  pending: { label: "Pendente", variant: "warning", icon: Clock },
  refund: { label: "Reembolso", variant: "info", icon: RotateCcw },
  cancelled: { label: "Cancelado", variant: "danger", icon: XCircle },
};

const METHOD_LABELS: Record<string, string> = {
  pix: "PIX",
  mercado_pago: "Mercado Pago",
  asaas: "Asaas",
  stripe: "Stripe",
  cash: "Dinheiro",
};

export function AdminPayments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [payments, setPayments] = useState<DashboardPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPayments().then(setPayments).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter((p) => {
    const matchSearch = p.pilotName.toLowerCase().includes(search.toLowerCase()) ||
      p.eventName.toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionId ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((acc, p) => acc + p.amount, 0);
  const totalRefund = payments.filter((p) => p.status === "refund").reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Pagamentos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{loading ? "Carregando..." : `${payments.length} transações registradas`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />}>Sincronizar</Button>
          <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>Exportar CSV</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Recebido" value={totalPaid} prefix="R$" icon={<DollarSign className="w-4 h-4" />} iconColor="text-emerald-500" loading={loading} />
        <StatCard label="Pendente" value={totalPending} prefix="R$" icon={<Clock className="w-4 h-4" />} iconColor="text-amber-500" loading={loading} />
        <StatCard label="Reembolsado" value={totalRefund} prefix="R$" icon={<RotateCcw className="w-4 h-4" />} iconColor="text-blue-500" loading={loading} />
        <StatCard label="Transações" value={payments.length} icon={<CreditCard className="w-4 h-4" />} iconColor="text-zinc-400" loading={loading} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por piloto, evento ou ID da transação..."
            className="w-full h-9 pl-9 pr-3 bg-zinc-900 border border-zinc-800 rounded-[5px] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-800 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "paid", "pending", "refund", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 h-9 text-xs rounded-[5px] border whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? "bg-rose-950 text-rose-400 border-rose-900"
                  : "text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {s === "all" ? "Todos" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider">Piloto</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider hidden md:table-cell">Evento</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider hidden lg:table-cell">Método</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider hidden lg:table-cell">Data</th>
                <th className="text-right px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider">Valor</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment, i) => {
                const config = STATUS_CONFIG[payment.status] ?? { label: payment.status, variant: "ghost" as const, icon: CheckCircle };
                const methodLabel = METHOD_LABELS[payment.method] ?? payment.method;
                return (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-zinc-600">{payment.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-zinc-200">{payment.pilotName}</p>
                      {payment.category && <Badge variant="outline" size="sm">{payment.category}</Badge>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-zinc-400 truncate max-w-[160px]">{payment.eventName}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="font-mono text-xs text-zinc-400">{methodLabel}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-zinc-500 font-mono">
                        {format(new Date(payment.createdAt), "dd/MM/yy HH:mm")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-mono font-bold text-sm text-white">R$ {payment.amount.toLocaleString("pt-BR")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant} dot={payment.status === "pending"}>
                        {config.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button className="w-7 h-7 flex items-center justify-center rounded-[4px] text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
