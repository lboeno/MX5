import { useState, useEffect, useRef } from "react";
import { X, Upload, FileText, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { fetchCategories } from "../../services/events/categories";
import type { EventDetail, EventFormData, EventStatus, ScheduleType, SponsorTier } from "../../types/events";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => Promise<void>;
  event?: EventDetail | null;
  saving?: boolean;
}

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "upcoming", label: "Em breve" },
  { value: "registration_open", label: "Inscrições abertas" },
  { value: "running", label: "Em andamento" },
  { value: "finished", label: "Encerrado" },
  { value: "cancelled", label: "Cancelado" },
];

const SCHEDULE_TYPES: { value: ScheduleType; label: string }[] = [
  { value: "practice", label: "Treino" },
  { value: "qualifying", label: "Classificatório" },
  { value: "race", label: "Corrida" },
  { value: "ceremony", label: "Cerimônia" },
  { value: "break", label: "Intervalo" },
  { value: "other", label: "Outro" },
];

const TIER_OPTIONS: { value: SponsorTier; label: string }[] = [
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
  { value: "media", label: "Media" },
];

const emptyForm = (): EventFormData => ({
  title: "",
  subtitle: "",
  description: "",
  city: "",
  state: "",
  address: "",
  organizer: "",
  startDate: "",
  endDate: "",
  registrationOpen: "",
  registrationClose: "",
  entryFee: 0,
  maxPilots: 100,
  eventStatus: "upcoming",
  isFeatured: false,
  categories: [],
  schedule: [],
  sponsors: [],
  attachments: [],
});

export function EventFormModal({ open, onClose, onSave, event, saving }: Props) {
  const [form, setForm] = useState<EventFormData>(emptyForm());
  const [catOptions, setCatOptions] = useState<{ id: string; name: string }[]>([]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    if (open) {
      fetchCategories().then(setCatOptions).catch(console.error);
      if (event) {
        setForm({
          title: event.title,
          subtitle: event.subtitle ?? "",
          description: event.description ?? "",
          city: event.city,
          state: event.state,
          address: event.address ?? "",
          organizer: event.organizer ?? "",
          startDate: event.startDate,
          endDate: event.endDate,
          registrationOpen: event.registrationOpen ?? "",
          registrationClose: event.registrationClose ?? "",
          entryFee: event.entryFee,
          maxPilots: event.maxPilots,
          eventStatus: event.eventStatus,
          isFeatured: event.isFeatured,
          categories: event.categories,
          schedule: event.schedule.map((s) => ({
            day: s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            title: s.title,
            description: s.description,
            type: s.type,
          })),
          sponsors: event.sponsors.map((s) => ({
            name: s.name,
            logo: s.logo,
            website: s.website,
            tier: s.tier,
          })),
          attachments: event.attachments?.map((a) => ({
            name: a.name,
            file: null as unknown as File,
            filePath: a.filePath,
            mimeType: a.mimeType,
            fileSize: a.fileSize,
          })) ?? [],
        });
        setCoverPreview(event.coverImage ?? null);
        setBannerPreview(event.bannerImage ?? null);
        setGalleryPreviews(event.galleryImages ?? []);
      } else {
        setForm(emptyForm());
        setCoverPreview(null);
        setBannerPreview(null);
        setGalleryPreviews([]);
      }
      setCoverFile(null);
      setBannerFile(null);
      setGalleryFiles([]);
    }
  }, [open, event]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...form,
      coverFile,
      bannerFile,
      galleryFiles,
    });
  };

  const toggleCategory = (name: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(name)
        ? f.categories.filter((c) => c !== name)
        : [...f.categories, name],
    }));
  };

  const addScheduleItem = () => {
    setForm((f) => ({
      ...f,
      schedule: [...f.schedule, { day: 1, startTime: "08:00", title: "", type: "other" as ScheduleType }],
    }));
  };

  const updateSchedule = (i: number, field: string, value: unknown) => {
    setForm((f) => {
      const s = [...f.schedule];
      s[i] = { ...s[i], [field]: value } as typeof s[0];
      return { ...f, schedule: s };
    });
  };

  const removeSchedule = (i: number) => {
    setForm((f) => ({ ...f, schedule: f.schedule.filter((_, idx) => idx !== i) }));
  };

  const addSponsor = () => {
    setForm((f) => ({ ...f, sponsors: [...f.sponsors, { name: "" }] }));
  };

  const updateSponsor = (i: number, field: string, value: unknown) => {
    setForm((f) => {
      const s = [...f.sponsors];
      s[i] = { ...s[i], [field]: value } as typeof s[0];
      return { ...f, sponsors: s };
    });
  };

  const removeSponsor = (i: number) => {
    setForm((f) => ({ ...f, sponsors: f.sponsors.filter((_, idx) => idx !== i) }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setForm((f) => ({
      ...f,
      attachments: [
        ...(f.attachments ?? []),
        ...files.map((file) => ({ name: file.name, file, mimeType: file.type, fileSize: file.size })),
      ],
    }));
  };

  const removeAttachment = (index: number) => {
    setForm((f) => ({
      ...f,
      attachments: (f.attachments ?? []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-[10px] w-full max-w-3xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-lg text-foreground">
            {event ? "Editar Evento" : "Novo Evento"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Título *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Subtítulo</label>
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full px-3 py-2 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Cidade *</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Estado *</label>
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Endereço</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Rua, número, bairro..."
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Organizador</label>
              <input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                placeholder="Nome do organizador ou empresa"
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Data início *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Data fim *</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Inscrições abrem</label>
              <input type="datetime-local" value={form.registrationOpen} onChange={(e) => setForm({ ...form, registrationOpen: e.target.value })}
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Inscrições fecham</label>
              <input type="datetime-local" value={form.registrationClose} onChange={(e) => setForm({ ...form, registrationClose: e.target.value })}
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Taxa (R$)</label>
              <input type="number" min={0} value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: Number(e.target.value) })}
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Vagas</label>
              <input type="number" min={1} value={form.maxPilots} onChange={(e) => setForm({ ...form, maxPilots: Number(e.target.value) })}
                className="w-full h-9 px-3 bg-card border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800" />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Imagens</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Cover */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Capa</label>
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                {coverPreview ? (
                  <div className="relative group">
                    <img src={coverPreview} alt="Capa" className="w-full h-32 object-cover rounded-[5px] border border-border" />
                    <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => coverInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-border rounded-[5px] flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-rose-800 hover:text-foreground transition-colors">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Capa do evento</span>
                  </button>
                )}
              </div>
              {/* Banner */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Banner</label>
                <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                {bannerPreview ? (
                  <div className="relative group">
                    <img src={bannerPreview} alt="Banner" className="w-full h-32 object-cover rounded-[5px] border border-border" />
                    <button type="button" onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => bannerInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-border rounded-[5px] flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-rose-800 hover:text-foreground transition-colors">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Banner do evento</span>
                  </button>
                )}
              </div>
            </div>
            {/* Gallery */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Galeria de fotos</label>
              <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
              <div className="flex flex-wrap gap-2">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative group w-20 h-20">
                    <img src={src} alt="" className="w-full h-full object-cover rounded-[4px] border border-border" />
                    <button type="button" onClick={() => removeGalleryImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => galleryInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-border rounded-[4px] flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:border-rose-800 hover:text-foreground transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-[9px]">Adicionar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Anexos (PDFs, documentos)</h3>
              <button type="button" onClick={() => attachInputRef.current?.click()} className="text-xs text-rose-500 hover:text-rose-400">+ Adicionar arquivo</button>
            </div>
            <input ref={attachInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" multiple onChange={handleAttachmentChange} className="hidden" />
            {(form.attachments ?? []).length > 0 && (
              <div className="space-y-1">
                {form.attachments!.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-[4px] border border-border/50">
                    <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">{att.name}</span>
                    {att.fileSize && <span className="text-[10px] text-muted-foreground">{(att.fileSize / 1024).toFixed(0)} KB</span>}
                    <button type="button" onClick={() => removeAttachment(i)} className="text-rose-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Event Status */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Status do evento</label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setForm({ ...form, eventStatus: opt.value })}
                  className={`px-3 py-1.5 text-xs rounded-[5px] border transition-colors ${
                    form.eventStatus === opt.value
                      ? "bg-rose-950 text-rose-400 border-rose-900"
                      : "text-muted-foreground border-border hover:border-zinc-600"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Featured */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="w-3.5 h-3.5 accent-rose-600" />
            <span className="text-xs text-zinc-400">Evento em destaque</span>
          </label>

          {/* Categories */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Categorias</label>
            <div className="flex gap-2 flex-wrap">
              {catOptions.map((cat) => (
                <button key={cat.id} type="button" onClick={() => toggleCategory(cat.name)}
                  className={`px-3 py-1.5 text-xs rounded-[5px] border transition-colors ${
                    form.categories.includes(cat.name)
                      ? "bg-blue-950 text-blue-400 border-blue-900"
                      : "text-zinc-500 border-zinc-800 hover:border-zinc-600"
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-zinc-400">Cronograma</label>
              <button type="button" onClick={addScheduleItem} className="text-xs text-rose-500 hover:text-rose-400">+ Adicionar</button>
            </div>
            {form.schedule.map((item, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input placeholder="Dia" type="number" min={1} value={item.day} onChange={(e) => updateSchedule(i, "day", Number(e.target.value))}
                  className="w-14 h-8 px-2 bg-card border border-border rounded-[4px] text-xs text-foreground" />
                <input type="time" value={item.startTime} onChange={(e) => updateSchedule(i, "startTime", e.target.value)}
                  className="w-20 h-8 px-2 bg-card border border-border rounded-[4px] text-xs text-foreground" />
                <input placeholder="Título" value={item.title} onChange={(e) => updateSchedule(i, "title", e.target.value)}
                  className="flex-1 h-8 px-2 bg-card border border-border rounded-[4px] text-xs text-foreground" />
                <select value={item.type} onChange={(e) => updateSchedule(i, "type", e.target.value)}
                  className="w-24 h-8 px-1 bg-card border border-border rounded-[4px] text-xs text-foreground">
                  {SCHEDULE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <button type="button" onClick={() => removeSchedule(i)} className="text-rose-500 hover:text-rose-400 text-xs">X</button>
              </div>
            ))}
          </div>

          {/* Sponsors */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Patrocinadores</label>
              <button type="button" onClick={addSponsor} className="text-xs text-rose-500 hover:text-rose-400">+ Adicionar</button>
            </div>
            {form.sponsors.map((item, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <input placeholder="Nome" value={item.name} onChange={(e) => updateSponsor(i, "name", e.target.value)}
                  className="flex-1 h-8 px-2 bg-card border border-border rounded-[4px] text-xs text-foreground" />
                <input placeholder="Site" value={item.website ?? ""} onChange={(e) => updateSponsor(i, "website", e.target.value)}
                  className="w-32 h-8 px-2 bg-card border border-border rounded-[4px] text-xs text-foreground" />
                <select value={item.tier ?? ""} onChange={(e) => updateSponsor(i, "tier", e.target.value || undefined)}
                  className="w-20 h-8 px-1 bg-card border border-border rounded-[4px] text-xs text-foreground">
                  <option value="">Tier</option>
                  {TIER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <button type="button" onClick={() => removeSponsor(i)} className="text-rose-500 hover:text-rose-400 text-xs">X</button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="md" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              {saving ? "Salvando..." : event ? "Salvar alterações" : "Criar evento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
