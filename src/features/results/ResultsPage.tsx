import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Trophy, Flag, Users } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EVENTS } from "../../data/mock";

const MOCK_RESULTS = [
  { pilotName: "Rafael Andrade", pilotNumber: "1", team: "KTM Factory Brazil", position: 1, points: 25, totalTime: "35:12.456", gap: "–", fastestLap: "1:42.123", dnf: false, dns: false },
  { pilotName: "Lucas Feitosa", pilotNumber: "7", team: "Husqvarna Brasil", position: 2, points: 22, totalTime: "35:18.901", gap: "+6.445", fastestLap: "1:42.890", dnf: false, dns: false },
  { pilotName: "Thiago Melo", pilotNumber: "21", team: "Yamaha Racing Brasil", position: 3, points: 20, totalTime: "35:24.234", gap: "+11.778", fastestLap: "1:43.445", dnf: false, dns: false },
  { pilotName: "Diego Costa", pilotNumber: "33", team: "Honda CRF BR", position: 4, points: 18, totalTime: "35:31.567", gap: "+19.111", fastestLap: "1:44.012", dnf: false, dns: false },
  { pilotName: "Felipe Nunes", pilotNumber: "55", team: "Kawasaki Racing", position: 5, points: 16, totalTime: "35:45.890", gap: "+33.434", fastestLap: "1:44.789", dnf: false, dns: false },
  { pilotName: "Anderson Silva", pilotNumber: "19", team: "TM Racing Brasil", position: 6, points: 15, totalTime: "36:02.123", gap: "+49.667", fastestLap: "1:45.234", dnf: false, dns: false },
  { pilotName: "Marcos Oliveira", pilotNumber: "62", team: "Independente", position: 0, points: 0, totalTime: "–", gap: "DNF", fastestLap: "–", dnf: true, dns: false },
];

export function ResultsPage() {
  const [selectedEvent, setSelectedEvent] = useState("e3");
  const completedEvents = EVENTS.filter((e) => e.status === "completed");
  const event = EVENTS.find((e) => e.id === selectedEvent);

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="border-b border-border py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono mb-4">
            <Link to="/" className="hover:text-zinc-400">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-400">Resultados</span>
          </div>
            <h1 className="font-display font-bold text-4xl text-foreground mb-2">Resultados</h1>
            <p className="text-muted-foreground">Classificação oficial das corridas encerradas</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Event selector */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {completedEvents.length === 0 ? (
            <p className="text-sm text-zinc-600">Nenhum evento encerrado ainda</p>
          ) : (
            completedEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setSelectedEvent(ev.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-[5px] border text-sm transition-colors ${
                  selectedEvent === ev.id
                    ? "bg-rose-950 text-rose-300 border-rose-800"
                    : "text-muted-foreground border-border hover:border-zinc-600 hover:text-foreground/80"
                }`}
              >
                {ev.name}
              </button>
            ))
          )}
        </div>

        {event && (
          <div className="space-y-6">
            {/* Event summary */}
            <div className="grid sm:grid-cols-3 gap-3">
              <Card className="flex items-center gap-3">
                <Flag className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Categoria</p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {event.categories.slice(0, 2).map((c) => <Badge key={c} variant="outline" size="sm">{c}</Badge>)}
                  </div>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Pilotos classificados</p>
                  <p className="font-display font-bold text-lg text-foreground mt-0.5">{MOCK_RESULTS.filter((r) => !r.dnf).length}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Vencedor</p>
                  <p className="font-display font-bold text-base text-foreground mt-0.5">{MOCK_RESULTS[0].pilotName}</p>
                </div>
              </Card>
            </div>

            {/* Results table — MX1 */}
              <Card padding="none">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-display font-semibold text-base text-foreground">Classificação Final — MX1 · 1ª Bateria</h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">Resultado oficial homologado · Copa Sul Etapa Final · Cascavel/PR</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Pos.</th>
                      <th className="text-left px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Piloto</th>
                      <th className="text-left px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden md:table-cell">Equipe</th>
                      <th className="text-right px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Tempo Total</th>
                      <th className="text-right px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Diferença</th>
                      <th className="text-right px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Melhor Volta</th>
                      <th className="text-right px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_RESULTS.map((result, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`border-b border-border/60 last:border-0 transition-colors ${
                          result.dnf ? "opacity-50" : i === 0 ? "bg-amber-950/10 hover:bg-amber-950/20" : "hover:bg-muted/40"
                        }`}
                      >
                        <td className="px-4 py-3">
                          {result.dnf ? (
                            <Badge variant="danger" size="sm">DNF</Badge>
                          ) : (
                            <span className={`font-mono font-bold text-base ${
                              result.position === 1 ? "text-amber-400" :
                              result.position === 2 ? "text-zinc-400" :
                              result.position === 3 ? "text-amber-700" : "text-zinc-600"
                            }`}>{result.position}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-rose-400">{result.pilotNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground/80">{result.pilotName}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-xs text-muted-foreground">{result.team}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-foreground/80">{result.totalTime}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs hidden sm:table-cell">
                          <span className={result.gap === "–" ? "text-emerald-400" : result.gap === "DNF" ? "text-rose-500" : "text-muted-foreground"}>
                            {result.gap}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground hidden lg:table-cell">{result.fastestLap}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono font-bold text-sm text-foreground/80">{result.points}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
