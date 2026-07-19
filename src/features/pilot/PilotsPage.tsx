import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Users, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { fetchPilots } from "../../lib/pilots";
import type { Category, Pilot } from "../../types";

const CATEGORIES: Category[] = ["MX1", "MX2", "MXF", "MX_VET", "MX_JR"];

export function PilotsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPilots()
      .then(setPilots)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = pilots.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.number.includes(search) ||
      (p.team ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen pt-20 bg-[#09090b]">
      <div className="border-b border-zinc-800 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono mb-4">
            <Link to="/" className="hover:text-zinc-400">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-400">Pilotos</span>
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-2">Pilotos</h1>
          <p className="text-zinc-500">Todos os pilotos registrados no campeonato</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar piloto, número ou equipe..."
              className="w-full h-9 pl-9 pr-3 bg-zinc-900 border border-zinc-800 rounded-[5px] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-800 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-3 h-9 text-xs rounded-[5px] border transition-colors ${
                  category === cat
                    ? "bg-rose-950 text-rose-400 border-rose-900"
                    : "text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                {cat === "all" ? "Todos" : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((pilot, i) => (
            <motion.div
              key={pilot.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/pilotos/${pilot.id}`}>
                <Card hover className="flex flex-col items-center text-center gap-3 py-6">
                  <div className="relative">
                    <img
                      src={pilot.photo}
                      alt={pilot.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-rose-600 border-2 border-[#111113] flex items-center justify-center">
                      <span className="font-display font-bold text-white text-[11px]">#{pilot.number}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm text-zinc-100">{pilot.name}</h3>
                    {pilot.nickname && <p className="text-[11px] text-zinc-600">"{pilot.nickname}"</p>}
                    <p className="text-xs text-zinc-500 mt-1">{pilot.team ?? "Independente"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" size="sm">{pilot.category}</Badge>
                    <Badge variant={pilot.status === "active" ? "success" : "danger"} size="sm">
                      {pilot.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 w-full gap-2 pt-3 border-t border-zinc-800">
                    {[
                      { label: "Pts", value: pilot.points },
                      { label: "Vitórias", value: pilot.wins },
                      { label: "#Rank", value: pilot.ranking },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <p className="font-mono font-bold text-sm text-zinc-200">{stat.value}</p>
                        <p className="text-[10px] text-zinc-600">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600 font-mono">{pilot.motorcycle.brand} {pilot.motorcycle.model}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Nenhum piloto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
