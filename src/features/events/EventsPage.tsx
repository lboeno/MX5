import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Search, Calendar, MapPin, Users, ChevronRight, Flag, Pencil } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { fetchAllEvents } from "../../services/events";
import { format } from "date-fns";
import type { EventSummary } from "../../types/events";
import { isEnrollmentOpen } from "../../types/events";
import { useAuth } from "../../context/AuthContext";

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Em breve",
  registration_open: "Inscrições abertas",
  running: "Em andamento",
  finished: "Encerrado",
  cancelled: "Cancelado",
};

const STATUS_VARIANTS: Record<string, "info" | "success" | "warning" | "default" | "danger" | "outline" | "ghost"> = {
  upcoming: "info",
  registration_open: "success",
  running: "warning",
  finished: "default",
  cancelled: "danger",
};

const HOME_STATUS_FILTERS = ["all", "registration_open", "upcoming", "finished"] as const;

export function EventsPage() {
  const { isAdmin, hasAnyRole } = useAuth();
  const canEdit = isAdmin || hasAnyRole(["admin", "organizer"]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof HOME_STATUS_FILTERS)[number]>("all");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAllEvents({ publicationStatus: "published" })
      .then((data) => { if (active) setEvents(data); })
      .catch((err) => {
        console.error("[EventsPage] Erro ao carregar:", err);
        if (active) setError("Não foi possível carregar os eventos.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return events.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(term) ||
        e.city.toLowerCase().includes(term);
      const matchStatus = statusFilter === "all" || e.eventStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, search, statusFilter]);

  return (
    <div className="min-h-screen pt-20 bg-[#09090b]">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/20 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono mb-4">
            <Link to="/" className="hover:text-zinc-400">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-400">Eventos</span>
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-2">Eventos</h1>
          <p className="text-zinc-500">Calendário completo de competições de motocross no Brasil</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar evento ou cidade..."
              className="w-full h-9 pl-9 pr-3 bg-zinc-900 border border-zinc-800 rounded-[5px] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-800 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {HOME_STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 h-9 text-xs rounded-[5px] border transition-colors ${
                  statusFilter === status
                    ? "bg-rose-950 text-rose-400 border-rose-900"
                    : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                {status === "all" ? "Todos" : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-zinc-600 font-mono mb-6">
          {loading ? "Carregando..." : `${filtered.length} evento${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {error && (
          <div className="rounded-[6px] border border-rose-900/60 bg-rose-950/30 px-4 py-3 text-sm text-rose-300 mb-6">
            {error}
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 rounded-[8px] bg-zinc-900/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover padding="none" className="overflow-hidden h-full flex flex-col relative group">
                  <Link to={`/eventos/${event.slug}`} className="block">
                    <div className="relative h-44 bg-zinc-900">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/20 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant={STATUS_VARIANTS[event.eventStatus] ?? "default"} dot={event.eventStatus === "registration_open"}>
                          {STATUS_LABELS[event.eventStatus] ?? event.eventStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div>
                        <p className="text-[10px] font-mono text-zinc-600 mb-1">
                          {event.championshipName ?? "Portal MX"} · {event.city}
                        </p>
                        <h3 className="font-display font-semibold text-sm text-zinc-100 leading-snug">{event.title}</h3>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-mono">
                            {format(new Date(event.startDate), "dd/MM")} — {format(new Date(event.endDate), "dd/MM/yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{event.city}, {event.state}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Users className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{event.registeredPilots}/{event.maxPilots} pilotos</span>
                          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-700 rounded-full"
                              style={{ width: `${Math.min((event.registeredPilots / Math.max(event.maxPilots, 1)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1 flex-wrap">
                        {event.categories.slice(0, 4).map((cat) => (
                          <Badge key={cat} variant="outline" size="sm">{cat}</Badge>
                        ))}
                        {event.categories.length > 4 && (
                          <Badge variant="ghost" size="sm">+{event.categories.length - 4}</Badge>
                        )}
                      </div>

                      <div className="mt-auto pt-3 border-t border-zinc-800 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-zinc-600 font-mono">Taxa de inscrição</p>
                          <p className="font-display font-bold text-base text-white">
                            R$ {event.entryFee.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        {isEnrollmentOpen(event.eventStatus) ? (
                          <Link
                            to={`/eventos/${event.slug}/inscrever`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center font-medium border rounded-[5px] bg-rose-600 hover:bg-rose-500 text-white border-rose-600 hover:border-rose-500 shadow-[0_0_16px_rgba(225,29,72,0.25)] hover:shadow-[0_0_24px_rgba(225,29,72,0.4)] h-9 px-4 text-sm transition-all"
                          >
                            Inscrever-se
                          </Link>
                        ) : (
                          <Button variant="outline" size="sm">
                            {event.eventStatus === "finished" ? "Resultados" : "Detalhes"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Link>

                  {canEdit && (
                    <button
                      onClick={() => navigate(`/admin/eventos?edit=${event.id}`)}
                      title="Editar no admin"
                      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-[5px] bg-black/60 hover:bg-rose-600 text-zinc-200 hover:text-white backdrop-blur-sm transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Flag className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Nenhum evento encontrado</p>
            <button onClick={() => { setSearch(""); setStatusFilter("all"); }} className="mt-2 text-xs text-rose-500 hover:underline">
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

