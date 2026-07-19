import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EVENTS } from "../../data/mock";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function EventStatusBadge({ status }: { status: string }) {
  if (status === "upcoming") return <Badge variant="info" size="sm">Em breve</Badge>;
  if (status === "open") return <Badge variant="success" size="sm" dot>Abertas</Badge>;
  if (status === "completed") return <Badge variant="default" size="sm">Encerrado</Badge>;
  return null;
}

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7, 1)); // Aug 2025

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to start on Sunday
  const startPad = monthStart.getDay();
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const eventsInMonth = EVENTS.filter((e) => {
    const d = new Date(e.date);
    return isSameMonth(d, currentMonth);
  });

  const getEventsForDay = (day: Date) =>
    EVENTS.filter((e) => isSameDay(new Date(e.date), day) || isSameDay(new Date(e.endDate), day));

  return (
    <div className="min-h-screen pt-20 bg-[#09090b]">
      <div className="border-b border-zinc-800 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono mb-4">
            <Link to="/" className="hover:text-zinc-400">Início</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400">Calendário</span>
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-2">Calendário 2025</h1>
          <p className="text-zinc-500">Todos os eventos da temporada em uma visão</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card padding="none" className="overflow-hidden">
              {/* Month navigation */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-[4px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="font-display font-semibold text-base text-white capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-[4px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Days header */}
              <div className="grid grid-cols-7 border-b border-zinc-800">
                {DAYS.map((d) => (
                  <div key={d} className="py-2 text-center text-[10px] font-mono font-medium text-zinc-600 uppercase">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7">
                {paddedDays.map((day, i) => {
                  if (!day) return <div key={`pad-${i}`} className="h-16 border-r border-b border-zinc-800/50 last:border-r-0" />;
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-16 p-1.5 border-r border-b border-zinc-800/50 last:border-r-0 relative ${
                        isToday ? "bg-rose-950/20" : "hover:bg-zinc-900/40"
                      }`}
                    >
                      <span className={`text-[11px] font-mono ${isToday ? "text-rose-400 font-bold" : "text-zinc-500"}`}>
                        {format(day, "d")}
                      </span>
                      {dayEvents.map((ev) => (
                        <Link key={ev.id} to={`/eventos/${ev.slug}`}>
                          <div className={`mt-0.5 px-1 py-0.5 rounded-[2px] text-[9px] truncate leading-tight ${
                            ev.status === "open" ? "bg-emerald-900/60 text-emerald-400" :
                            ev.status === "completed" ? "bg-zinc-800 text-zinc-500" :
                            "bg-blue-900/60 text-blue-400"
                          }`}>
                            {ev.location.city}
                          </div>
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Events this month */}
          <div>
            <h3 className="font-display font-semibold text-sm text-white mb-4">
              Eventos em {format(currentMonth, "MMMM", { locale: ptBR })}
            </h3>
            {eventsInMonth.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-600">Nenhum evento neste mês</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventsInMonth.map((event) => (
                  <motion.div key={event.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
                    <Link to={`/eventos/${event.slug}`}>
                      <Card hover className="flex gap-3 items-start">
                        <div className="flex-shrink-0 w-10 text-center">
                          <p className="text-[10px] font-mono text-zinc-600 capitalize">
                            {format(new Date(event.date), "MMM", { locale: ptBR })}
                          </p>
                          <p className="font-display font-bold text-xl text-white leading-none">
                            {format(new Date(event.date), "dd")}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <EventStatusBadge status={event.status} />
                          <h4 className="text-xs font-medium text-zinc-200 mt-1 leading-snug line-clamp-2">{event.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-600">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location.city}, {event.location.state}</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Full year events */}
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <h3 className="font-display font-semibold text-sm text-white mb-4">Todos os Eventos 2025</h3>
              <div className="space-y-2">
                {EVENTS.map((ev) => (
                  <Link key={ev.id} to={`/eventos/${ev.slug}`} className="flex items-center gap-2 p-2 rounded-[4px] hover:bg-zinc-900 transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      ev.status === "open" ? "bg-emerald-500" :
                      ev.status === "completed" ? "bg-zinc-600" :
                      "bg-blue-500"
                    }`} />
                    <span className="text-xs text-zinc-400 font-mono w-12 flex-shrink-0">{format(new Date(ev.date), "dd/MM")}</span>
                    <span className="text-xs text-zinc-400 truncate">{ev.location.city}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
