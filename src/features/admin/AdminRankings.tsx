import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Trophy } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { RaceResultFormModal } from "./RaceResultFormModal";
import {
  fetchRaceResults, createRaceResult, updateRaceResult, deleteRaceResult,
  getCategoryOptions, getChampionshipOptions, fetchEventsForFilter,
  type RaceResultRow, type RaceResultInput,
} from "../../services/raceResults";
import type { FilterOption } from "../../types/rankings";

const selectCls =
  "w-full h-9 px-3 bg-input border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800 transition-colors";

const STATUS_VARIANTS: Record<string, "success" | "danger" | "warning" | "ghost"> = {
  finished: "success",
  dnf: "danger",
  dns: "warning",
  dsq: "ghost",
};

const STATUS_LABELS: Record<string, string> = {
  finished: "Finalizado",
  dnf: "DNF",
  dns: "DNS",
  dsq: "DSQ",
};

const HEAT_LABELS: Record<string, string> = {
  race: "Corrida",
  qualifying: "Classificação",
  heat1: "Bateria 1",
  heat2: "Bateria 2",
  final: "Final",
};

export function AdminRankings() {
  const [championshipId, setChampionshipId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [eventId, setEventId] = useState("");
  const [search, setSearch] = useState("");
  const [championships, setChampionships] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [events, setEvents] = useState<FilterOption[]>([]);
  const [results, setResults] = useState<RaceResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RaceResultRow | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRaceResults({ championshipId, categoryId, eventId });
      setResults(data);
    } catch (err) {
      console.error("[AdminRankings] Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }, [championshipId, categoryId, eventId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getChampionshipOptions().then(setChampionships).catch(console.error);
    getCategoryOptions().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    let active = true;
    fetchEventsForFilter(championshipId || undefined)
      .then((ev) => {
        if (active) {
          setEvents(ev);
          setEventId("");
        }
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, [championshipId]);

  const handleSave = async (input: RaceResultInput) => {
    setSaving(true);
    try {
      if (editing) {
        await updateRaceResult(editing.id, input);
      } else {
        await createRaceResult(input);
      }
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      console.error("[AdminRankings] Erro ao salvar:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: RaceResultRow) => {
    if (!confirm(`Excluir o resultado de "${r.pilotName}" em "${r.eventTitle}"?`)) return;
    try {
      await deleteRaceResult(r.id);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = results.filter((r) =>
    r.pilotName.toLowerCase().includes(search.toLowerCase()) ||
    (r.pilotNumber && r.pilotNumber.includes(search)) ||
    (r.eventTitle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Rankings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Carregando..." : `${results.length} resultados`}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Novo Resultado
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar piloto ou evento..."
            className="w-full h-9 pl-9 pr-3 bg-input border border-border rounded-[5px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-rose-800 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={championshipId} onChange={(e) => setChampionshipId(e.target.value)} className={selectCls + " w-auto"}>
            <option value="">Todos campeonatos</option>
            {championships.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectCls + " w-auto"}>
            <option value="">Todas categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={selectCls + " w-auto"}>
            <option value="">Todos eventos</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Piloto</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden lg:table-cell">Evento</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Bateria</th>
                <th className="text-right px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Pos.</th>
                <th className="text-right px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Pontos</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">Carregando...</td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-[4px] flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{r.pilotName}</p>
                          {r.pilotNumber && <p className="text-[11px] text-muted-foreground/70 font-mono">#{r.pilotNumber}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-muted-foreground">{r.categoryName}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{r.eventTitle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">{HEAT_LABELS[r.heat]}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-mono text-sm font-bold text-foreground">{r.position}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-mono text-sm text-foreground/80">{Number(r.points).toFixed(1)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[r.status]} size="sm">{STATUS_LABELS[r.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(r);
                            setModalOpen(true);
                          }}
                          title="Editar"
                          className="w-7 h-7 flex items-center justify-center rounded-[4px] text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          title="Excluir"
                          className="w-7 h-7 flex items-center justify-center rounded-[4px] text-muted-foreground/70 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nenhum resultado encontrado</p>
          </div>
        )}
      </Card>

      <RaceResultFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        result={editing}
        saving={saving}
      />
    </div>
  );
}
