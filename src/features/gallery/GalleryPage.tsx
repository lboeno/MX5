import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { GALLERY } from "../../data/mock";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function GalleryPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const events = ["all", ...Array.from(new Set(GALLERY.map((g) => g.eventName).filter(Boolean)))];
  const filtered = filter === "all" ? GALLERY : GALLERY.filter((g) => g.eventName === filter);

  const navigate = (dir: 1 | -1) => {
    if (selected === null) return;
    const next = (selected + dir + filtered.length) % filtered.length;
    setSelected(next);
  };

  return (
    <div className="min-h-screen pt-20 bg-[#09090b]">
      <div className="border-b border-zinc-800 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono mb-4">
            <Link to="/" className="hover:text-zinc-400">Início</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400">Galeria</span>
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-2">Galeria</h1>
          <p className="text-zinc-500">Momentos épicos capturados nas competições</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {events.map((ev) => (
            <button
              key={ev as string}
              onClick={() => setFilter(ev as string)}
              className={`flex-shrink-0 px-3 h-8 text-xs rounded-[4px] border transition-colors ${
                filter === ev
                  ? "bg-rose-950 text-rose-400 border-rose-900"
                  : "text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {ev === "all" ? "Todos os eventos" : ev as string}
            </button>
          ))}
        </div>

        {/* Masonry-style Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(i)}
              className="break-inside-avoid relative group cursor-pointer rounded-[6px] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
            >
              <img
                src={photo.thumbnail}
                alt={photo.alt}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ aspectRatio: i % 3 === 0 ? "4/3" : "1/1" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs text-white font-medium truncate">{photo.alt}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">{photo.photographer}</p>
                </div>
                <div className="absolute top-3 right-3">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
              </div>
              {photo.featured && (
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:text-white"
              onClick={() => setSelected(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:text-white"
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:text-white"
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <motion.div
              key={selected}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filtered[selected].url}
                alt={filtered[selected].alt}
                className="w-full max-h-[75vh] object-contain rounded-[8px]"
              />
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{filtered[selected].alt}</p>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    {filtered[selected].photographer} · {format(new Date(filtered[selected].takenAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <p className="text-xs text-zinc-700 font-mono">{selected + 1} / {filtered.length}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
