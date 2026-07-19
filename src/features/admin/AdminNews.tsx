import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Newspaper } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { NewsFormModal } from "./NewsFormModal";
import {
  fetchNews,
  createNews,
  updateNews,
  deleteNews,
  publishNews,
  type NewsInput,
} from "../../services/news";
import type { NewsArticle } from "../../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORY_LABELS: Record<NewsArticle["category"], string> = {
  race_report: "Cobertura",
  news: "Notícia",
  interview: "Entrevista",
  preview: "Prévia",
  analysis: "Análise",
};

const STATUS_VARIANTS: Record<string, "ghost" | "success"> = {
  draft: "ghost",
  published: "success",
};

export function AdminNews() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNews({ status: statusFilter, search });
      setArticles(data);
    } catch (err) {
      console.error("[AdminNews] Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (input: NewsInput) => {
    setSaving(true);
    try {
      if (editing) {
        await updateNews(editing.id, input);
      } else {
        await createNews(input);
      }
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      console.error("[AdminNews] Erro ao salvar:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (a: NewsArticle) => {
    try {
      await publishNews(a.id, a.status !== "published");
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (a: NewsArticle) => {
    if (!confirm(`Excluir a notícia "${a.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteNews(a.id);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Notícias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Carregando..." : `${articles.length} notícias`}
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
          Nova Notícia
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar notícia..."
            className="w-full h-9 pl-9 pr-3 bg-input border border-border rounded-[5px] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-rose-800 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 h-9 text-xs rounded-[5px] border whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? "bg-rose-950 text-rose-400 border-rose-900"
                  : "text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {s === "all" ? "Todas" : s === "published" ? "Publicadas" : "Rascunhos"}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">
                  Notícia
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden md:table-cell">
                  Categoria
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider hidden lg:table-cell">
                  Data
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">
                  Status
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
                articles.map((a, i) => (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-[4px] flex items-center justify-center flex-shrink-0">
                          <Newspaper className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[280px]">{a.title}</p>
                          <p className="text-[11px] text-muted-foreground/70 font-mono truncate max-w-[280px]">
                            {a.author || "—"} {a.featured ? "• Destaque" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[a.category]}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-muted-foreground font-mono">
                        {format(new Date(a.publishedAt), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[a.status ?? "draft"]} size="sm">
                        {a.status === "published" ? "Publicado" : "Rascunho"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleTogglePublish(a)}
                          title={a.status === "published" ? "Despublicar" : "Publicar"}
                          className="w-7 h-7 flex items-center justify-center rounded-[4px] text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {a.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditing(a);
                            setModalOpen(true);
                          }}
                          title="Editar"
                          className="w-7 h-7 flex items-center justify-center rounded-[4px] text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
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
        {!loading && articles.length === 0 && (
          <div className="text-center py-16">
            <Newspaper className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nenhuma notícia encontrada</p>
          </div>
        )}
      </Card>

      <NewsFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        article={editing}
        saving={saving}
      />
    </div>
  );
}
