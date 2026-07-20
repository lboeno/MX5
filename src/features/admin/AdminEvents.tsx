import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Search, Edit2, Copy, Archive, XCircle, MoreHorizontal, Flag, Trash2,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EventFormModal } from "./EventFormModal";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAllEvents, createEvent, updateEvent,
  publishEvent, unpublishEvent, archiveEvent, cancelEvent, duplicateEvent, deleteEvent,
  uploadEventImage, uploadEventAttachment,
} from "../../services/events";
import type { EventSummary, EventDetail, EventFormData } from "../../types/events";
import { format } from "date-fns";

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

const PUB_STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

const PUB_STATUS_VARIANTS: Record<string, "ghost" | "success" | "info"> = {
  draft: "ghost",
  published: "success",
  archived: "info",
};

export function AdminEvents() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllEvents({ status: statusFilter, search });
      setEvents(data);
    } catch (err) {
      console.error("[AdminEvents] Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-open edit modal when navigating with ?edit=<id> (e.g. from Home events)
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      handleEdit(editId);
      searchParams.delete("edit");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (form: EventFormData) => {
    if (!user) return;
    setSaving(true);
    try {
      const { coverFile, bannerFile, galleryFiles, ...restForm } = form;

      if (editingEvent) {
        // Process uploads for existing event
        const processedImages: { coverUrl?: string; bannerUrl?: string; galleryUrls?: string[] } = {};
        if (coverFile) processedImages.coverUrl = await uploadEventImage(editingEvent.id, coverFile, "cover");
        if (bannerFile) processedImages.bannerUrl = await uploadEventImage(editingEvent.id, bannerFile, "banner");
        if (galleryFiles && galleryFiles.length > 0) {
          processedImages.galleryUrls = await Promise.all(
            galleryFiles.map((f) => uploadEventImage(editingEvent.id, f, "gallery"))
          );
        }

        // Upload new attachments
        const formAttachments = form.attachments ?? [];
        const attachmentsWithPaths = await Promise.all(
          formAttachments.map(async (att) => {
            if (att.filePath) return att; // already uploaded
            if (!att.file) return att;
            const filePath = await uploadEventAttachment(editingEvent.id, att.file);
            return { ...att, filePath, mimeType: att.mimeType ?? att.file.type, fileSize: att.fileSize ?? att.file.size };
          })
        );

        await updateEvent(editingEvent.id, { ...restForm, attachments: attachmentsWithPaths }, processedImages);
      } else {
        // Create event first (no files yet), then upload files
        const created = await createEvent(restForm, user.id);
        const processedImages: { coverUrl?: string; bannerUrl?: string; galleryUrls?: string[] } = {};

        if (coverFile) processedImages.coverUrl = await uploadEventImage(created.id, coverFile, "cover");
        if (bannerFile) processedImages.bannerUrl = await uploadEventImage(created.id, bannerFile, "banner");
        if (galleryFiles && galleryFiles.length > 0) {
          processedImages.galleryUrls = await Promise.all(
            galleryFiles.map((f) => uploadEventImage(created.id, f, "gallery"))
          );
        }

        // Upload attachments and update event with URLs
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
      console.error("[AdminEvents] Erro ao salvar:", err);
    } finally {
      setSaving(false);
    }
  };

  async function handleEdit(id: string) {
    const { getEvent } = await import("../../services/events");
    const ev = await getEvent(id);
    if (ev) {
      setEditingEvent(ev);
      setModalOpen(true);
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await publishEvent(id);
      await load();
    } catch (err) { console.error(err); }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishEvent(id);
      await load();
    } catch (err) { console.error(err); }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveEvent(id);
      await load();
    } catch (err) { console.error(err); }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelEvent(id);
      await load();
    } catch (err) { console.error(err); }
  };

  const handleDuplicate = async (id: string) => {
    if (!user) return;
    try {
      await duplicateEvent(id, user.id);
      await load();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (event: EventSummary) => {
    if (!confirm(`Excluir o evento "${event.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteEvent(event.id);
      await load();
    } catch (err) { console.error(err); }
  };

  const filtered = events;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Eventos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Carregando..." : `${events.length} eventos cadastrados`}
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}
          onClick={() => { setEditingEvent(null); setModalOpen(true); }}>
          Novo Evento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento..."
            className="w-full h-9 pl-9 pr-3 bg-input border border-border rounded-[5px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-rose-800 transition-colors" />
        </div>
        <div className="flex gap-2">
          {(["all", "registration_open", "upcoming", "running", "finished", "cancelled"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 h-9 text-xs rounded-[5px] border whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? "bg-rose-950 text-rose-400 border-rose-900"
                  : "text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
              }`}>
              {s === "all" ? "Todos" : EV_STATUS_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Evento</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden md:table-cell">Data</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden lg:table-cell">Local</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">Pub.</th>
                  <th className="text-right px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden sm:table-cell">Pilotos</th>
                  <th className="text-right px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden sm:table-cell">Taxa</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">Carregando...</td></tr>
              ) : filtered.map((event, i) => (
                <motion.tr key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-[4px] flex items-center justify-center flex-shrink-0">
                        <Flag className="w-3.5 h-3.5 text-rose-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{event.title}</p>
                        <p className="text-[11px] text-muted-foreground/70 font-mono truncate max-w-[200px]">{event.championshipName ?? ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-muted-foreground font-mono">
                      {format(new Date(event.startDate), "dd/MM/yy")} – {format(new Date(event.endDate), "dd/MM/yy")}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">{event.city}, {event.state}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={EV_STATUS_VARIANTS[event.eventStatus] ?? "default"} dot={event.eventStatus === "registration_open"}>
                      {EV_STATUS_LABELS[event.eventStatus] ?? event.eventStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={PUB_STATUS_VARIANTS[event.publicationStatus] ?? "ghost"} size="sm">
                      {PUB_STATUS_LABELS[event.publicationStatus] ?? event.publicationStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-right">
                    <p className="text-xs font-mono text-foreground/80">{event.registeredPilots}/{event.maxPilots}</p>
                    {event.maxPilots > 0 && (
                      <div className="mt-1 h-1 w-16 ml-auto bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-rose-700 rounded-full"
                          style={{ width: `${Math.min((event.registeredPilots / event.maxPilots) * 100, 100)}%` }} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-right">
                    <p className="font-mono text-sm font-bold text-foreground">R$ {event.entryFee}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-[4px] text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === event.id && (
                        <div className="absolute right-0 top-8 w-48 bg-card border border-zinc-700 rounded-[6px] shadow-xl z-10 py-1">
                          <ActionItem icon={Edit2} label="Editar evento" onClick={() => { setOpenMenuId(null); handleEdit(event.id); }} />
                          <ActionItem icon={Copy} label="Duplicar" onClick={() => { setOpenMenuId(null); handleDuplicate(event.id); }} />
                          {event.publicationStatus !== "published" ? (
                            <ActionItem icon={Plus} label="Publicar" onClick={() => { setOpenMenuId(null); handlePublish(event.id); }} />
                          ) : (
                            <ActionItem icon={Archive} label="Rascunho" onClick={() => { setOpenMenuId(null); handleUnpublish(event.id); }} />
                          )}
                          <ActionItem icon={Archive} label="Arquivar" onClick={() => { setOpenMenuId(null); handleArchive(event.id); }} />
                          {event.eventStatus !== "cancelled" && (
                            <ActionItem icon={XCircle} label="Cancelar evento" danger onClick={() => { setOpenMenuId(null); handleCancel(event.id); }} />
                          )}
                          <ActionItem icon={Trash2} label="Excluir evento" danger onClick={() => { setOpenMenuId(null); handleDelete(event); }} />
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Flag className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nenhum evento encontrado</p>
          </div>
        )}
      </Card>

      <EventFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        onSave={handleSave}
        event={editingEvent}
        saving={saving}
      />
    </div>
  );
}

function ActionItem({ icon: Icon, label, onClick, danger }: {
  icon: typeof Edit2;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
        danger ? "text-rose-400 hover:bg-rose-950/50" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
