import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Star, ImageIcon } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { GalleryFormModal } from "./GalleryFormModal";
import { fetchGallery, createGallery, updateGallery, deleteGallery, type GalleryInput } from "../../services/gallery";
import type { GalleryPhoto } from "../../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AdminGallery() {
  const [search, setSearch] = useState("");
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryPhoto | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGallery({ search });
      setPhotos(data);
    } catch (err) {
      console.error("[AdminGallery] Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (input: GalleryInput) => {
    setSaving(true);
    try {
      if (editing) {
        await updateGallery(editing.id, input);
      } else {
        await createGallery(input);
      }
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      console.error("[AdminGallery] Erro ao salvar:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: GalleryPhoto) => {
    if (!confirm(`Excluir a foto "${p.alt}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteGallery(p.id);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Galeria</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Carregando..." : `${photos.length} fotos`}
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
          Nova Foto
        </Button>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por legenda, fotógrafo ou evento..."
          className="w-full h-9 pl-9 pr-3 bg-input border border-border rounded-[5px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-rose-800 transition-colors"
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">
                  Foto
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden md:table-cell">
                  Evento
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden lg:table-cell">
                  Data
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">
                  Destaque
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                    Carregando...
                  </td>
                </tr>
              ) : (
                photos.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.thumbnail}
                          alt={p.alt}
                          className="w-12 h-9 object-cover rounded-[4px] border border-border flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[240px]">{p.alt}</p>
                          <p className="text-[11px] text-muted-foreground/70 font-mono truncate max-w-[240px]">
                            {p.photographer || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {p.eventName ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-muted-foreground font-mono">
                        {format(new Date(p.takenAt), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {p.featured ? (
                        <Badge variant="warning" size="sm">
                          <Star className="w-3 h-3" /> Destaque
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setModalOpen(true);
                          }}
                          title="Editar"
                          className="w-7 h-7 flex items-center justify-center rounded-[4px] text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
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
        {!loading && photos.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nenhuma foto encontrada</p>
          </div>
        )}
      </Card>

      <GalleryFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        photo={editing}
        saving={saving}
      />
    </div>
  );
}
