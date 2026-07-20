import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import type { NewsArticle } from "../../types";
import type { NewsInput } from "../../services/news";

type FormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorPhoto: string;
  tags: string;
  category: NewsArticle["category"];
  featured: boolean;
  status: "draft" | "published";
};

const CATEGORY_OPTIONS: { value: NewsArticle["category"]; label: string }[] = [
  { value: "race_report", label: "Cobertura de corrida" },
  { value: "news", label: "Notícia" },
  { value: "interview", label: "Entrevista" },
  { value: "preview", label: "Prévia" },
  { value: "analysis", label: "Análise" },
];

const inputCls =
  "w-full h-9 px-3 bg-background border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800";

export function NewsFormModal({
  open,
  onClose,
  onSave,
  article,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (input: NewsInput) => Promise<void>;
  article: NewsArticle | null;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>(empty());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setForm(
        article
          ? {
              title: article.title,
              slug: article.slug,
              excerpt: article.excerpt,
              content: article.content,
              coverImage: article.coverImage,
              author: article.author,
              authorPhoto: article.authorPhoto ?? "",
              tags: article.tags.join(", "),
              category: article.category,
              featured: article.featured,
              status: article.status ?? "draft",
            }
          : empty()
      );
    }
  }, [open, article]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("O título é obrigatório.");
      return;
    }
    setError(null);
    try {
      await onSave({
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        coverImage: form.coverImage.trim(),
        author: form.author.trim(),
        authorPhoto: form.authorPhoto.trim() || undefined,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        category: form.category,
        featured: form.featured,
        status: form.status,
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
            {article ? "Editar Notícia" : "Nova Notícia"}
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
            <label className="block text-xs font-medium text-muted-foreground mb-1">Título *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Slug (opcional)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="gerado a partir do título"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Autor</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Resumo</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-background border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Conteúdo</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              placeholder="Texto da matéria (suporta HTML básico)"
              className="w-full px-3 py-2 bg-background border border-border rounded-[5px] text-sm text-foreground focus:outline-none focus:border-rose-800"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Imagem de capa (URL)</label>
              <input
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="https://..."
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Foto do autor (URL)</label>
              <input
                value={form.authorPhoto}
                onChange={(e) => setForm({ ...form, authorPhoto: e.target.value })}
                placeholder="https://..."
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as FormData["category"] })}
                className={inputCls}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (separadas por vírgula)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="mx5, campeonato, 2026"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-3.5 h-3.5 accent-rose-600"
              />
              <span className="text-xs text-zinc-400">Destaque</span>
            </label>
            <div className="flex gap-2">
              {(["draft", "published"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`px-3 py-1.5 text-xs rounded-[5px] border transition-colors ${
                    form.status === s
                      ? "bg-rose-950 text-rose-400 border-rose-900"
                      : "text-muted-foreground border-border hover:border-zinc-600"
                  }`}
                >
                  {s === "draft" ? "Rascunho" : "Publicado"}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              {saving ? "Salvando..." : article ? "Salvar alterações" : "Criar notícia"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function empty(): FormData {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "",
    authorPhoto: "",
    tags: "",
    category: "news",
    featured: false,
    status: "draft",
  };
}
