import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Activity, AlertTriangle, Info, AlertCircle,
  ShieldAlert, Download, Loader2,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { getAllLogs } from "../../services/dashboard/logs";
import type { DashboardLog } from "../../types/dashboard";
import { format } from "date-fns";

const LEVEL_CONFIG = {
  info: { label: "Info", icon: Info, variant: "info" as const, color: "text-blue-400" },
  warning: { label: "Aviso", icon: AlertTriangle, variant: "warning" as const, color: "text-amber-400" },
  error: { label: "Erro", icon: AlertCircle, variant: "danger" as const, color: "text-rose-400" },
  critical: { label: "Critico", icon: ShieldAlert, variant: "danger" as const, color: "text-red-400" },
};

export function AdminLogs() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [logs, setLogs] = useState<DashboardLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    const term = search.toLowerCase();
    const matchSearch =
      log.details.toLowerCase().includes(term) ||
      log.userName.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.entity.toLowerCase().includes(term);
    const matchLevel = levelFilter === "all" || log.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Logs do Sistema</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {loading ? "Carregando..." : `${logs.length} registros de auditoria`}
          </p>
        </div>
        <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>Exportar</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar em logs..."
            className="w-full h-9 pl-9 pr-3 bg-zinc-900 border border-zinc-800 rounded-[5px] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-800 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["all", "info", "warning", "error", "critical"].map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`px-3 h-9 text-xs rounded-[5px] border transition-colors capitalize ${
                levelFilter === level
                  ? "bg-rose-950 text-rose-400 border-rose-900"
                  : "text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {level === "all" ? "Todos" : LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG]?.label ?? level}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider">Nivel</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider">Detalhes</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider hidden md:table-cell">Usuario</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider hidden lg:table-cell">Acao</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-zinc-600 uppercase tracking-wider hidden sm:table-cell">Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <Loader2 className="w-5 h-5 text-zinc-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.map((log, i) => {
                const config = LEVEL_CONFIG[log.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG.info;
                const Icon = config.icon;
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border-b border-zinc-800/60 last:border-0 transition-colors ${
                      log.level === "critical" ? "bg-rose-950/10 hover:bg-rose-950/20" : "hover:bg-zinc-900/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                        <Badge variant={config.variant} size="sm">{config.label}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-zinc-300 max-w-[250px] truncate">{log.details}</p>
                      <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
                        {log.entity}{log.entityId ? ` - #${log.entityId}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-zinc-400">{log.userName}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="font-mono text-[11px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-[2px]">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="font-mono text-[11px] text-zinc-500">
                        {format(new Date(log.createdAt), "dd/MM/yy HH:mm:ss")}
                      </p>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">Nenhum log encontrado</p>
          </div>
        )}
      </Card>
    </div>
  );
}
