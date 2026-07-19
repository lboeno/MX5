import { useState, useEffect, useCallback } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { fetchAllEvents } from "../../services/events";
import { getRegistrationsForEvent } from "../../services/registrations";
import { STEP_LABELS, type CurrentStep } from "../../domain/registration/stateMachine";
import type { EventSummary, EventRegistration } from "../../types/events";

const STEP_VARIANT: Record<CurrentStep, "default" | "success" | "warning" | "danger" | "info"> = {
  registration: "info",
  review: "warning",
  payment: "warning",
  approved: "success",
  checkin: "info",
  racing: "info",
  finished: "success",
};

const PAYMENT_VARIANT: Record<string, "default" | "success" | "warning" | "danger"> = {
  pending: "warning",
  paid: "success",
  refunded: "default",
  cancelled: "danger",
  na: "default",
};

export function AdminRegistrations() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [search, setSearch] = useState("");

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const data = await fetchAllEvents();
      setEvents(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (err) {
      console.error("[AdminRegistrations] erro eventos:", err);
    } finally {
      setLoadingEvents(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const loadRegs = useCallback(async (eventId: string) => {
    setLoadingRegs(true);
    try {
      const data = await getRegistrationsForEvent(eventId);
      setRegistrations(data);
    } catch (err) {
      console.error("[AdminRegistrations] erro inscritos:", err);
      setRegistrations([]);
    } finally {
      setLoadingRegs(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadRegs(selectedId);
  }, [selectedId, loadRegs]);

  const filteredRegs = registrations.filter((r) =>
    search
      ? r.pilotName.toLowerCase().includes(search.toLowerCase()) ||
        (r.registrationNumber ?? "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Inscrições</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loadingEvents ? "Carregando..." : `${events.length} eventos`}
          </p>
        </div>
      </div>

      {/* Event selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(e.target.value)}
          className="h-9 px-3 bg-input border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar piloto ou nº de inscrição..."
            className="w-full h-9 pl-9 pr-3 bg-input border border-border rounded-[5px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-rose-800"
          />
        </div>
      </div>

      {/* List */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Piloto</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden md:table-cell">Nº</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden lg:table-cell">Equipe</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Etapa</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Pagamento</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden md:table-cell">Inscrição</th>
              </tr>
            </thead>
            <tbody>
              {loadingRegs ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredRegs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhuma inscrição encontrada
                  </td>
                </tr>
              ) : (
                filteredRegs.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{r.pilotName}</p>
                      <p className="text-[11px] text-muted-foreground/70 font-mono">{r.registrationNumber ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm font-mono text-foreground/80">{r.pilotNumber || "—"}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs text-muted-foreground">{r.category}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{r.team ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STEP_VARIANT[r.currentStep]} dot>{STEP_LABELS[r.currentStep]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={PAYMENT_VARIANT[r.paymentStatus] ?? "default"}>
                        {r.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-[11px] font-mono text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
