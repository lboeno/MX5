import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  fetchPilots, fetchEventsForFilter, getCategoryOptions, getChampionshipOptions,
} from "../../services/raceResults";
import type { RaceResultRow, RaceResultInput } from "../../services/raceResults";
import type { FilterOption } from "../../types/rankings";

const HEAT_OPTIONS = [
  { value: "race", label: "Corrida" },
  { value: "qualifying", label: "Classificação" },
  { value: "heat1", label: "Bateria 1" },
  { value: "heat2", label: "Bateria 2" },
  { value: "final", label: "Final" },
];

const STATUS_OPTIONS = [
  { value: "finished", label: "Finalizado" },
  { value: "dnf", label: "DNF" },
  { value: "dns", label: "DNS" },
  { value: "dsq", label: "DSQ" },
];

const selectCls =
  "w-full h-10 px-3 bg-background border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800";

export function RaceResultFormModal({
  open,
  onClose,
  onSave,
  result,
  defaultEventId,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (input: RaceResultInput) => Promise<void>;
  result: RaceResultRow | null;
  defaultEventId?: string;
  saving: boolean;
}) {
  const [pilots, setPilots] = useState<FilterOption[]>([]);
  const [events, setEvents] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [championships, setChampionships] = useState<FilterOption[]>([]);

  const [championshipId, setChampionshipId] = useState<string>("");
  const [pilotId, setPilotId] = useState("");
  const [eventId, setEventId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [heat, setHeat] = useState<RaceResultInput["heat"]>("race");
  const [position, setPosition] = useState("1");
  const [points, setPoints] = useState("0");
  const [status, setStatus] = useState<RaceResultInput["status"]>("finished");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    Promise.all([fetchPilots(), getCategoryOptions(), getChampionshipOptions()])
      .then(([p, c, ch]) => {
        setPilots(p);
        setCategories(c);
        setChampionships(ch);
      })
      .catch(console.error);

    if (result) {
      setPilotId(result.pilotId);
      setEventId(result.eventId);
      setCategoryId(result.categoryId);
      setHeat(result.heat);
      setPosition(String(result.position));
      setPoints(String(result.points));
      setStatus(result.status);
      setChampionshipId("");
      loadEvents();
    } else {
      setPilotId("");
      setEventId(defaultEventId ?? "");
      setCategoryId("");
      setHeat("race");
      setPosition("1");
      setPoints("0");
      setStatus("finished");
      setChampionshipId("");
      loadEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, result]);

  async function loadEvents(chId?: string) {
    try {
      const ev = await fetchEventsForFilter(chId || undefined);
      setEvents(ev);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleChampionshipChange(value: string) {
    setChampionshipId(value);
    setEventId("");
    await loadEvents(value || undefined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pilotId) return setError("Selecione o piloto.");
    if (!eventId) return setError("Selecione o evento.");
    if (!categoryId) return setError("Selecione a categoria.");
    const pos = Number(position);
    if (!Number.isInteger(pos) || pos < 1) return setError("A posição deve ser um número maior que zero.");

    try {
      await onSave({
        pilotId,
        eventId,
        categoryId,
        position: pos,
        points: Number(points) || 0,
        status,
        heat,
      });
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("race_results_unique")) {
        setError("Já existe um resultado para este piloto neste evento/categoria/bateria.");
      } else {
        setError(err?.message ?? "Erro ao salvar.");
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-[10px] w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-lg text-foreground">
            {result ? "Editar Resultado" : "Novo Resultado"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Campeonato</label>
              <select value={championshipId} onChange={(e) => handleChampionshipChange(e.target.value)} className={selectCls}>
                <option value="">Todos (filtrar eventos)</option>
                {championships.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Evento *</label>
              <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={selectCls} required>
                <option value="">Selecione...</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Piloto *</label>
              <select value={pilotId} onChange={(e) => setPilotId(e.target.value)} className={selectCls} required>
                <option value="">Selecione...</option>
                {pilots.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectCls} required>
                <option value="">Selecione...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Bateria</label>
              <select value={heat} onChange={(e) => setHeat(e.target.value as RaceResultInput["heat"])} className={selectCls}>
                {HEAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as RaceResultInput["status"])} className={selectCls}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Posição *</label>
              <input type="number" min={1} value={position} onChange={(e) => setPosition(e.target.value)} className={selectCls} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Pontos</label>
              <input type="number" min={0} step="0.1" value={points} onChange={(e) => setPoints(e.target.value)} className={selectCls} />
            </div>
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              {saving ? "Salvando..." : result ? "Salvar alterações" : "Criar resultado"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
