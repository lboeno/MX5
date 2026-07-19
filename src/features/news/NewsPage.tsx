import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Newspaper, ChevronRight, Eye } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { NEWS } from "../../data/mock";
import { format } from "date-fns";

const CATEGORY_LABELS = {
  race_report: "Relatório",
  news: "Notícia",
  interview: "Entrevista",
  preview: "Preview",
  analysis: "Análise",
};

const CATEGORY_VARIANTS = {
  race_report: "danger",
  news: "info",
  interview: "success",
  preview: "warning",
  analysis: "default",
} as const;

export function NewsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = NEWS.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || n.category === category;
    return matchSearch && matchCat;
  });

  const featured = NEWS.find((n) => n.featured);
  const rest = filtered.filter((n) => !n.featured || search || category !== "all");

  return (
    <div className="min-h-screen pt-20 bg-[#09090b]">
      <div className="border-b border-zinc-800 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono mb-4">
            <Link to="/" className="hover:text-zinc-400">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-400">Notícias</span>
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-2">Notícias</h1>
          <p className="text-zinc-500">Cobertura completa do motocross nacional</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar notícias..."
              className="w-full h-9 pl-9 pr-3 bg-zinc-900 border border-zinc-800 rounded-[5px] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-800 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "race_report", "news", "interview", "analysis"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 h-9 text-xs rounded-[5px] border transition-colors ${
                  category === cat
                    ? "bg-rose-950 text-rose-400 border-rose-900"
                    : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                {cat === "all" ? "Todos" : CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featured && search === "" && category === "all" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card hover padding="none" className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-64 md:h-full bg-zinc-900 relative min-h-[200px]">
                  <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="danger">Destaque</Badge>
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={CATEGORY_VARIANTS[featured.category]} size="sm">
                      {CATEGORY_LABELS[featured.category]}
                    </Badge>
                    <span className="text-[11px] text-zinc-600 font-mono">
                      {format(new Date(featured.publishedAt), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white leading-tight mb-3">{featured.title}</h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-3">{featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {featured.authorPhoto && (
                        <img src={featured.authorPhoto} alt={featured.author} className="w-6 h-6 rounded-full border border-zinc-700" />
                      )}
                      <span className="text-xs text-zinc-500">{featured.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-600 font-mono">
                      <Eye className="w-3 h-3" />
                      {featured.views.toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(search || category !== "all" ? filtered : rest).map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover padding="none" className="overflow-hidden h-full flex flex-col">
                <div className="h-44 bg-zinc-900 relative">
                  <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111113] to-transparent" />
                </div>
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={CATEGORY_VARIANTS[article.category]} size="sm">
                      {CATEGORY_LABELS[article.category]}
                    </Badge>
                    <span className="text-[10px] text-zinc-600 font-mono">{format(new Date(article.publishedAt), "dd/MM/yyyy")}</span>
                  </div>
                  <h3 className="font-display font-semibold text-sm text-zinc-100 leading-snug flex-1 line-clamp-3">{article.title}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800">
                    <span className="text-xs text-zinc-600">{article.author}</span>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-700 font-mono">
                      <Eye className="w-3 h-3" />
                      {article.views.toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Newspaper className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Nenhuma notícia encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
