import { useEffect, useRef, useState } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "../../components/ui/Button";
import type { GalleryPhoto } from "../../types";
import type { GalleryInput } from "../../services/gallery";
import { uploadGalleryImage } from "../../services/gallery";

type FormData = {
  eventName: string;
  alt: string;
  photographer: string;
  takenAt: string;
  tags: string;
  featured: boolean;
  url: string;
  thumbnail: string;
};

const inputCls =
  "w-full h-9 px-3 bg-background border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800";

function nowLocal(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function GalleryFormModal({
  open,
  onClose,
  onSave,
  photo,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (input: GalleryInput) => Promise<void>;
  photo: GalleryPhoto | null;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>(empty());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setImagePreview(null);
      setForm(
        photo
          ? {
              eventName: photo.eventName ?? "",
              alt: photo.alt,
              photographer: photo.photographer ?? "",
              takenAt: (photo.takenAt || nowLocal()).slice(0, 16),
              tags: photo.tags.join(", "),
              featured: photo.featured,
              url: photo.url,
              thumbnail: photo.thumbnail,
            }
          : { ...empty(), takenAt: nowLocal() }
      );
    }
  }, [open, photo]);

  if (!open) return null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadGalleryImage(file);
      const thumb = url.includes("?")
        ? `${url}&w=400&h=300&fit=crop&auto=format`
        : `${url}?w=400&h=300&fit=crop&auto=format`;
      const full = url.includes("?")
        ? `${url}&w=1200&h=800&fit=crop&auto=format`
        : `${url}?w=1200&h=800&fit=crop&auto=format`;
      setForm((f) => ({ ...f, url: full, thumbnail: thumb }));
      setImagePreview(url);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.alt.trim()) {
      setError("A legenda (alt) é obrigatória.");
      return;
    }
    if (!form.url) {
      setError("Envie uma imagem para a foto.");
      return;
    }
    setError(null);
    try {
      await onSave({
        eventId: undefined,
        eventName: form.eventName.trim() || undefined,
        url: form.url,
        thumbnail: form.thumbnail,
        alt: form.alt.trim(),
        photographer: form.photographer.trim(),
        takenAt: new Date(form.takenAt).toISOString(),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured: form.featured,
      });
    } catch (err: any) {
      setError(err?.message ?? "Erro ao salvar.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-[10px] w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-lg text-foreground">
            {photo ? "Editar Foto" : "Nova Foto"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Imagem *</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {imagePreview || form.url ? (
              <div className="relative group w-fit">
                <img
                  src={imagePreview || form.thumbnail}
                  alt="Preview"
                  className="w-48 h-32 object-cover rounded-[5px] border border-border"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-32 border-2 border-dashed border-border rounded-[5px] flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-rose-800 hover:text-foreground transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <span className="text-xs">Enviando...</span>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Enviar imagem</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Legenda (alt) *</label>
            <input
              value={form.alt}
              onChange={(e) => setForm({ ...form, alt: e.target.value })}
              placeholder="Ex: Rafael Andrade em ação na etapa 1"
              className={inputCls}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Evento</label>
              <input
                value={form.eventName}
                onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                placeholder="Ex: CBMX Etapa 1"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Fotógrafo</label>
              <input
                value={form.photographer}
                onChange={(e) => setForm({ ...form, photographer: e.target.value })}
                placeholder="Ex: André Fotos MX"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Data da foto</label>
              <input
                type="datetime-local"
                value={form.takenAt}
                onChange={(e) => setForm({ ...form, takenAt: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (vírgula)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="MX1, Andrade"
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-3.5 h-3.5 accent-rose-600"
            />
            <span className="text-xs text-zinc-400">Foto em destaque</span>
          </label>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" loading={saving || uploading}>
              {saving ? "Salvando..." : photo ? "Salvar alterações" : "Criar foto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function empty(): FormData {
  return {
    eventName: "",
    alt: "",
    photographer: "",
    takenAt: "",
    tags: "",
    featured: false,
    url: "",
    thumbnail: "",
  };
}
