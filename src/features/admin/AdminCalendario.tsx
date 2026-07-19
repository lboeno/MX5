import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EventFormModal } from "./EventFormModal";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAllEvents, getEvent, createEvent, updateEvent,
  uploadEventImage, uploadEventAttachment,
} from "../../services/events";
import type { EventDetail, EventFormData, EventStatus } from "../../types/events";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const EV_STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "Em breve",
  registration_open: "Inscrições abertas",
  running: "Em andamento",
  finished: "Encerrado",
  cancelled: "Cancelado",
};

const STATUS_VARIANTS: Record<string, "info" | "success" | "warning" | "default" | "danger" | "ghost"> = {
  upcoming: "info",
  registration_open: "success",
  running: "warning",
  finished: "default",
  cancelled: "danger",
};

const CHIP_COLORS: Record<EventStatus, string> = {
  upcoming: "bg-blue-900/60 text-blue-400",
  registration_open: "bg-emerald-900/60 text-emerald-400",
  running: "bg-amber-900/60 text-amber-400",
  finished: "bg-muted text-muted-foreground",
  cancelled: "bg-rose-900/60 text-rose-400",
};

type CalEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  eventStatus: EventStatus;
  city: string;
  state: string;
};

export function AdminCalendario() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [allEvents, setAllEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDetail | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllEvents({ status: statusFilter, search });
      const mapped: CalEvent[] = data.map((e) => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate,
        eventStatus: e.eventStatus,
        city: e.city,
        state: e.state,
      }));
      setAllEvents(mapped);
    } catch (err) {
      console.error("[AdminCalendario] Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const inMonth = allEvents.filter((e) => {
      const d = new Date(e.startDate);
      return d >= monthStart && d <= monthEnd;
    });
    setEvents(inMonth);
  }, [allEvents, currentMonth]);

  const handleSave = async (form: EventFormData) => {
    if (!user) return;
    setSaving(true);
    try {
      const { coverFile, bannerFile, galleryFiles, ...restForm } = form;

      if (editingEvent) {
        const processedImages: { coverUrl?: string; bannerUrl?: string; galleryUrls?: string[] } = {};
        if (coverFile) processedImages.coverUrl = await uploadEventImage(editingEvent.id, coverFile, "cover");
        if (bannerFile) processedImages.bannerUrl = await uploadEventImage(editingEvent.id, bannerFile, "banner");
        if (galleryFiles && galleryFiles.length > 0) {
          processedImages.galleryUrls = await Promise.all(
            galleryFiles.map((f) => uploadEventImage(editingEvent.id, f, "gallery"))
          );
        }
        const formAttachments = form.attachments ?? [];
        const attachmentsWithPaths = await Promise.all(
          formAttachments.map(async (att) => {
            if (att.filePath) return att;
            if (!att.file) return att;
            const filePath = await uploadEventAttachment(editingEvent.id, att.file);
            return { ...att, filePath, mimeType: att.mimeType ?? att.file.type, fileSize: att.fileSize ?? att.file.size };
          })
        );
        await updateEvent(editingEvent.id, { ...restForm, attachments: attachmentsWithPaths }, processedImages);
      } else {
        const created = await createEvent(restForm, user.id);
        const processedImages: { coverUrl?: string; bannerUrl?: string; galleryUrls?: string[] } = {};
        if (coverFile) processedImages.coverUrl = await uploadEventImage(created.id, coverFile, "cover");
        if (bannerFile) processedImages.bannerUrl = await uploadEventImage(created.id, bannerFile, "banner");
        if (galleryFiles && galleryFiles.length > 0) {
          processedImages.galleryUrls = await Promise.all(
            galleryFiles.map((f) => uploadEventImage(created.id, f, "gallery"))
          );
        }
        const formAttachments = form.attachments ?? [];
        if (formAttachments.length > 0 || processedImages.coverUrl || processedImages.bannerUrl) {
          const attachmentsWithPaths = await Promise.all(
            formAttachments.map(async (att) => {
              const filePath = await uploadEventAttachment(created.id, att.file);
              return { ...att, filePath, mimeType: att.mimeType ?? att.file.type, fileSize: att.fileSize ?? att.file.size };
            })
          );
          await updateEvent(created.id, { attachments: attachmentsWithPaths }, processedImages);
        }
      }

      setModalOpen(false);
      setEditingEvent(null);
      await load();
    } catch (err) {
      console.error("[AdminCalendario] Erro ao salvar:", err);
    } finally {
      setSaving(false);
    }
  };

  async function handleEdit(id: string) {
    const ev = await getEvent(id);
    if (ev) {
      setEditingEvent(ev);
      setModalOpen(true);
    }
  }

  function openNewForDay(_day: Date) {
    setEditingEvent(null);
    setModalOpen(true);
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const getEventsForDay = (day: Date) =>
    events.filter(
      (e) => isSameDay(new Date(e.startDate), day) || (e.endDate && isSameDay(new Date(e.endDate), day))
    );

  const eventsList = events;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-rose-500" /> Calendário
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Carregando..." : `${allEvents.length} eventos`}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingEvent(null);
            setModalOpen(true);
          }}
        >
          Novo Evento
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento..."
            className="w-full h-9 pl-9 pr-3 bg-input border border-border rounded-[5px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-rose-800 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "registration_open", "upcoming", "running", "finished", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 h-9 text-xs rounded-[5px] border whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? "bg-rose-950 text-rose-400 border-rose-900"
                  : "text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {s === "all" ? "Todos" : EV_STATUS_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-display font-semibold text-base text-foreground capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-border">
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-[10px] font-mono font-medium text-muted-foreground/70 uppercase">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {paddedDays.map((day, i) => {
                if (!day) return <div key={`pad-${i}`} className="h-20 border-r border-b border-border/50 last:border-r-0" />;
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => openNewForDay(day)}
                    className={`h-20 p-1.5 border-r border-b border-border/50 last:border-r-0 relative cursor-pointer ${
                      isToday ? "bg-rose-950/20" : "hover:bg-card/40"
                    }`}
                  >
                    <span className={`text-[11px] font-mono ${isToday ? "text-rose-400 font-bold" : "text-muted-foreground"}`}>
                      {format(day, "d")}
                    </span>
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(ev.id);
                        }}
                        className={`mt-0.5 block w-full px-1 py-0.5 rounded-[2px] text-[9px] truncate leading-tight text-left ${CHIP_COLORS[ev.eventStatus]}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Side list */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Eventos de {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : eventsList.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-[8px]">
              <CalendarIcon className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Nenhum evento neste mês</p>
            </div>
          ) : (
            eventsList
              .slice()
              .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
              .map((ev, i) => (
                <motion.button
                  key={ev.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleEdit(ev.id)}
                  className="w-full text-left bg-card border border-border/60 rounded-[8px] p-3 hover:border-border transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                    <Badge variant={STATUS_VARIANTS[ev.eventStatus]} size="sm">
                      {EV_STATUS_LABELS[ev.eventStatus]}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mt-1">
                    {format(new Date(ev.startDate), "dd/MM/yyyy")} · {ev.city}/{ev.state}
                  </p>
                </motion.button>
              ))
          )}
        </div>
      </div>

      <EventFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSave}
        event={editingEvent}
        saving={saving}
      />
    </div>
  );
}
