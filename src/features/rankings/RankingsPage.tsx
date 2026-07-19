import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy, Medal, Crown, ChevronRight, Search,
  AlertTriangle, Users, Layers, Clock, RefreshCw,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import {
  getRankingsOverview,
  getChampionshipStandings,
  getAvailableChampionships,
  getAvailableCategories,
  getAvailableEvents,
} from "../../services/rankings";
import type { RankingsOverview, RankingStanding, FilterOption } from "../../types/rankings";

function PositionIcon({ pos }: { pos: number }) {
  if (pos === 1) return <Crown className="w-4 h-4 text-amber-400" />;
  if (pos === 2) return <Medal className="w-4 h-4 text-zinc-400" />;
  if (pos === 3) return <Medal className="w-4 h-4 text-amber-700" />;
  return <span className="font-mono text-sm text-zinc-600 w-4 text-center">{pos}</span>;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60 animate-pulse">
      <div className="w-8 h-4 bg-zinc-800 rounded" />
      <div className="w-7 h-7 bg-zinc-800 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 bg-zinc-800 rounded" />
        <div className="h-2.5 w-20 bg-zinc-800 rounded" />
      </div>
      <div className="w-12 h-4 bg-zinc-800 rounded" />
      <div className="w-10 h-4 bg-zinc-800 rounded hidden sm:block" />
      <div className="w-10 h-4 bg-zinc-800 rounded hidden sm:block" />
    </div>
  );
}

export function RankingsPage() {
  const [overview, setOverview] = useState<RankingsOverview | null>(null);
  const [standings, setStandings] = useState<RankingStanding[]>([]);
  const [championships, setChampionships] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [events, setEvents] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [championshipId, setChampionshipId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [eventId, setEventId] = useState("");
  const [search, setSearch] = useState("");

  const loadFilters = useCallback(async () => {
    const [champs, cats] = await Promise.all([
      getAvailableChampionships(),
      getAvailableCategories(),
    ]);
    setChampionships(champs);
    setCategories(cats);
  }, []);

  const loadOverview = useCallback(async () => {
    try {
      const ov = await getRankingsOverview();
      setOverview(ov);
    } catch {
      // overview failure is non-critical
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const evts = await getAvailableEvents(championshipId || undefined);
      setEvents(evts);
    } catch {
      // events failure is non-critical
    }
  }, [championshipId]);

  const loadStandings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getChampionshipStandings(
        championshipId || undefined,
        categoryId || undefined,
        eventId || undefined,
      );

      let filtered = result;
      if (search.trim()) {
        const term = search.toLowerCase();
        filtered = result.filter(
          (s) =>
            s.pilotName.toLowerCase().includes(term) ||
            s.pilotNumber.toLowerCase().includes(term) ||
            (s.team && s.team.toLowerCase().includes(term)),
        );
      }

      setStandings(filtered);
    } catch (err) {
      console.error("[Rankings] Erro ao carregar classificação:", err);
      setError(err instanceof Error ? err.message : "Falha ao carregar classificação.");
    } finally {
      setLoading(false);
    }
  }, [championshipId, categoryId, eventId, search]);

  useEffect(() => {
    loadFilters();
    loadOverview();
    loadEvents();
  }, [loadFilters, loadOverview, loadEvents]);

  useEffect(() => {
    loadStandings();
  }, [loadStandings]);

  const overviewLeader = overview?.leader ?? null;

  return (
    <div className="min-h-screen pt-20 bg-[#09090b]">
      {/* Header */}
      <div className="border-b border-zinc-800 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono mb-4">
            <Link to="/" className="hover:text-zinc-400">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-400">Rankings</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display font-bold text-4xl text-white mb-2">Rankings</h1>
              <p className="text-zinc-500">Classificação geral do Campeonato Brasileiro de Motocross 2025</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="danger" dot>Temporada Ativa</Badge>
              <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={loadStandings}>
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950/30 border border-amber-900/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Líder</p>
                <p className="text-sm font-medium text-white truncate">
                  {overview?.leader?.name ?? "—"}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-950/30 border border-blue-900/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Pilotos</p>
                <p className="text-2xl font-bold text-white">{overview?.totalPilots ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/30 border border-emerald-900/20 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Categorias</p>
                <p className="text-2xl font-bold text-white">{overview?.totalCategories ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-950/30 border border-rose-900/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-rose-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Atualização</p>
                <p className="text-[11px] font-mono text-zinc-300 truncate">
                  {overview?.lastUpdated
                    ? new Date(overview.lastUpdated).toLocaleString("pt-BR")
                    : "—"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="w-full sm:w-56">
            <Select
              options={[
                { value: "", label: "Todos os campeonatos" },
                ...championships.map((c) => ({ value: c.id, label: c.label })),
              ]}
              value={championshipId}
              onChange={(e) => { setChampionshipId(e.target.value); setEventId(""); }}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              options={[
                { value: "", label: "Todas as categorias" },
                ...categories.map((c) => ({ value: c.id, label: c.label })),
              ]}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              options={[
                { value: "", label: "Todas as etapas" },
                ...events.map((e) => ({ value: e.id, label: e.label })),
              ]}
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Buscar piloto, número ou equipe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 rounded-[6px] border border-rose-900/50 bg-rose-950/20 p-3 mb-6">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-rose-300">Não foi possível carregar a classificação.</p>
              <p className="text-[11px] text-rose-500 font-mono mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && standings.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Nenhum resultado disponível</p>
            <p className="text-zinc-700 text-xs mt-1">Os rankings serão exibidos após o cadastro de resultados das etapas.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="lg:grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card padding="none" className="overflow-hidden">
                <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-[#111113] p-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex flex-col items-center animate-pulse">
                        <div className="w-12 h-12 bg-zinc-800 rounded-full mb-2" />
                        <div className="h-3 w-16 bg-zinc-800 rounded mb-1" />
                        <div className="h-4 w-12 bg-zinc-800 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                {[0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
              </Card>
            </div>
            <div className="hidden lg:block space-y-4">
              <Card><div className="h-64 bg-zinc-900/50 rounded animate-pulse" /></Card>
              <Card><div className="h-32 bg-zinc-900/50 rounded animate-pulse" /></Card>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && standings.length > 0 && (
          <div className="lg:grid lg:grid-cols-3 gap-6">
            {/* Main: Podium + Table */}
            <div className="lg:col-span-2 space-y-6">
              {/* Podium */}
              <Card padding="none" className="overflow-hidden">
                <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-[#111113] p-6">
                  <div className="grid grid-cols-3 gap-4">
                    {standings.slice(0, 3).map((_, i) => {
                      const order = [1, 0, 2][i];
                      const p = standings[order];
                      return (
                        <motion.div
                          key={p.pilotId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: order * 0.1 }}
                          className={`flex flex-col items-center text-center ${order === 0 ? "" : "mt-4"}`}
                        >
                          <div className="relative mb-2">
                            <div className={`rounded-full object-cover border-2 ${
                              order === 0 ? "w-16 h-16 border-amber-500/60" :
                              order === 1 ? "w-12 h-12 border-zinc-500/60" :
                              "w-12 h-12 border-amber-800/60"
                            } ${!p.photo ? "bg-zinc-800 flex items-center justify-center" : ""}`}>
                              {p.photo ? (
                                <img src={p.photo} alt={p.pilotName} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-lg font-bold text-zinc-600">{p.pilotName.charAt(0)}</span>
                              )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-zinc-800 ${
                              order === 0 ? "bg-amber-500 text-black" :
                              order === 1 ? "bg-zinc-500 text-white" :
                              "bg-amber-800 text-white"
                            }`}>
                              {p.position}
                            </div>
                          </div>
                          <p className="font-display font-semibold text-xs text-zinc-200 leading-tight">{p.pilotName.split(" ")[0]}</p>
                          <p className="font-mono font-bold text-sm text-white mt-0.5">{p.points} pts</p>
                          <p className="text-[10px] text-zinc-600 font-mono">#{p.pilotNumber}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto_auto_auto] gap-0 text-[10px] font-mono text-zinc-600 uppercase tracking-wider px-4 py-2 border-b border-zinc-800">
                    <span className="w-8 text-center">#</span>
                    <span className="w-4" />
                    <span>Piloto</span>
                    <span className="w-14 text-center">Pontos</span>
                    <span className="w-10 text-center hidden lg:table-cell">Vitórias</span>
                    <span className="w-10 text-center hidden lg:table-cell">Pódios</span>
                    <span className="w-14 text-center hidden xl:table-cell">Categoria</span>
                    <span className="w-20 text-center hidden xl:table-cell">Equipe</span>
                    <span className="w-14 text-center hidden lg:table-cell">Último</span>
                  </div>
                  {standings.map((pilot, i) => (
                    <motion.div
                      key={pilot.pilotId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto_auto_auto] gap-0 items-center px-4 py-3 border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40 transition-colors ${
                        i === 0 ? "bg-amber-950/10" : ""
                      }`}
                    >
                      <div className="w-8 flex justify-center">
                        <PositionIcon pos={pilot.position} />
                      </div>
                      <div className={`w-7 h-7 rounded-full border border-zinc-700 mr-3 flex items-center justify-center flex-shrink-0 ${
                        pilot.photo ? "" : "bg-zinc-800"
                      }`}>
                        {pilot.photo ? (
                          <img src={pilot.photo} alt={pilot.pilotName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-600">{pilot.pilotName.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          <span className="font-mono text-zinc-500 mr-1.5">#{pilot.pilotNumber}</span>
                          {pilot.pilotName}
                        </p>
                        <p className="text-[11px] text-zinc-600 truncate lg:hidden">{pilot.category}</p>
                      </div>
                      <div className="w-14 text-center">
                        <p className="font-mono font-bold text-sm text-white">{pilot.points}</p>
                      </div>
                      <div className="w-10 text-center hidden lg:table-cell">
                        <p className="font-mono text-sm text-zinc-400">{pilot.wins}</p>
                      </div>
                      <div className="w-10 text-center hidden lg:table-cell">
                        <p className="font-mono text-sm text-zinc-400">{pilot.podiums}</p>
                      </div>
                      <div className="w-14 text-center hidden xl:table-cell">
                        <p className="font-mono text-[11px] text-zinc-500">{pilot.category}</p>
                      </div>
                      <div className="w-20 text-center hidden xl:table-cell">
                        <p className="font-mono text-[11px] text-zinc-500 truncate">{pilot.team ?? "—"}</p>
                      </div>
                      <div className="w-14 text-center hidden lg:table-cell">
                        <Badge variant={pilot.lastResult?.includes("D") ? "danger" : "default"} size="sm">
                          {pilot.lastResult ?? "—"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-zinc-800/60">
                  {standings.map((pilot, i) => (
                    <motion.div
                      key={pilot.pilotId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="w-8 flex justify-center flex-shrink-0">
                        <PositionIcon pos={pilot.position} />
                      </div>
                      <div className={`w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center flex-shrink-0 ${
                        pilot.photo ? "" : "bg-zinc-800"
                      }`}>
                        {pilot.photo ? (
                          <img src={pilot.photo} alt={pilot.pilotName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-zinc-600">{pilot.pilotName.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-200 truncate">{pilot.pilotName}</p>
                          <Badge variant={pilot.lastResult?.includes("D") ? "danger" : "default"} size="sm">
                            {pilot.lastResult ?? "—"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-zinc-600">
                          <span className="font-mono">#{pilot.pilotNumber}</span>
                          {pilot.category ? <span> · {pilot.category}</span> : null}
                          {pilot.team ? <span> · {pilot.team}</span> : null}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-bold text-sm text-white">{pilot.points}</p>
                        <p className="text-[10px] text-zinc-600">
                          {pilot.wins}V · {pilot.podiums}P
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block space-y-4">
              <Card>
                <h3 className="font-display font-semibold text-sm text-white mb-4">Campeão Atual</h3>
                {standings[0] && (
                  <div className="flex flex-col items-center text-center py-2">
                    <div className="relative mb-3">
                      <div className={`w-20 h-20 rounded-full border-2 border-amber-500/60 flex items-center justify-center ${
                        standings[0].photo ? "" : "bg-zinc-800"
                      }`}>
                        {standings[0].photo ? (
                          <img src={standings[0].photo} alt={standings[0].pilotName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-zinc-600">{standings[0].pilotName.charAt(0)}</span>
                        )}
                      </div>
                      <Crown className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 text-amber-400" />
                    </div>
                    <p className="font-display font-bold text-lg text-white">{standings[0].pilotName}</p>
                    <p className="font-mono font-extrabold text-3xl text-rose-400 mt-1">{standings[0].points}</p>
                    <p className="text-xs text-zinc-600 font-mono">pontos</p>
                    <div className="grid grid-cols-3 w-full gap-3 mt-4 pt-4 border-t border-zinc-800">
                        {[
                          { label: "Vitórias", value: standings[0].wins },
                          { label: "Pódios", value: standings[0].podiums },
                          { label: "Eventos", value: standings[0].events },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center">
                            <p className="font-mono font-bold text-lg text-zinc-100">{stat.value}</p>
                            <p className="text-[10px] text-zinc-600">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </Card>

              {standings.length > 1 && (
                <Card>
                  <h3 className="font-display font-semibold text-sm text-white mb-3">Diferença para o Líder</h3>
                  <div className="space-y-3">
                    {standings.slice(1, 5).map((pilot) => {
                      const diff = standings[0].points - pilot.points;
                      const pct = standings[0].points > 0
                        ? Math.round((pilot.points / standings[0].points) * 100)
                        : 0;
                      return (
                        <div key={pilot.pilotId}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400 truncate mr-2">{pilot.pilotName.split(" ")[0]}</span>
                            <span className="font-mono text-rose-400 flex-shrink-0">-{diff} pts</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
