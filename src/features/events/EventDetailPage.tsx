import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar, MapPin, Users, ChevronRight,
  Clock, Flag, QrCode, Share2, Download, CheckCircle2, Loader2,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { getEventBySlug } from "../../services/events";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EventDetail, ScheduleType, SponsorTier } from "../../types/events";

const SCHEDULE_COLORS: Record<ScheduleType, string> = {
  practice: "text-blue-400 bg-blue-950",
  qualifying: "text-amber-400 bg-amber-950",
  race: "text-rose-400 bg-rose-950",
  ceremony: "text-emerald-400 bg-emerald-950",
  break: "text-zinc-400 bg-zinc-800",
  other: "text-zinc-400 bg-zinc-800",
};

const SCHEDULE_LABELS: Record<ScheduleType, string> = {
  practice: "Treino",
  qualifying: "Classificatório",
  race: "Corrida",
  ceremony: "Cerimônia",
  break: "Intervalo",
  other: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Em breve",
  registration_open: "Inscrições abertas",
  running: "Em andamento",
  finished: "Encerrado",
  cancelled: "Cancelado",
};

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    if (!slug) return;
    getEventBySlug(slug)
      .then((data) => {
        if (!active) return;
        if (data) setEvent(data);
        else setNotFound(true);
      })
      .catch((err) => {
        console.error("[EventDetail] Erro:", err);
        if (active) setNotFound(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Flag className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white mb-2">Evento não encontrado</h2>
          <Link to="/eventos"><Button variant="outline" size="sm">Voltar aos Eventos</Button></Link>
        </div>
      </div>
    );
  }

  const isOpen = event.eventStatus === "registration_open";
  const fillPct = Math.min((event.registeredPilots / Math.max(event.maxPilots, 1)) * 100, 100);
  const daysToDeadline = event.registrationClose
    ? Math.ceil((new Date(event.registrationClose).getTime() - Date.now()) / 86400000)
    : -1;

  // Group schedule by day
  const days = Array.from(new Set(event.schedule.map((s) => s.day))).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#09090b] pt-14">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 lg:h-96 bg-zinc-900 overflow-hidden">
        <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mb-3">
            <Link to="/" className="hover:text-zinc-300">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/eventos" className="hover:text-zinc-300">Eventos</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-400">{event.championship?.name ?? "Portal MX"}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant={isOpen ? "success" : "info"} dot className="mb-3">
                {STATUS_LABELS[event.eventStatus] ?? event.eventStatus}
              </Badge>
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white leading-tight">{event.title}</h1>
              {event.subtitle && <p className="text-sm text-zinc-400 mt-1">{event.subtitle}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" icon={<Share2 className="w-4 h-4" />}>Compartilhar</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Row */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: Calendar, label: "Data", value: `${format(new Date(event.startDate), "dd/MM")} a ${format(new Date(event.endDate), "dd/MM/yyyy")}` },
                { icon: MapPin, label: "Local", value: event.track ? `${event.track.name} — ${event.track.city}/${event.track.state}` : `${event.city}/${event.state}` },
                { icon: Users, label: "Pilotos", value: `${event.registeredPilots} de ${event.maxPilots} inscritos` },
              ].map((info) => {
                const Icon = info.icon;
                return (
                  <Card key={info.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[4px] bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase">{info.label}</p>
                      <p className="text-sm text-zinc-200 font-medium leading-tight mt-0.5">{info.value}</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Description */}
            <Card>
              <h2 className="font-display font-semibold text-base text-white mb-3">Sobre o Evento</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{event.description || "Sem descrição."}</p>
            </Card>

            {/* Categories */}
            {event.categories.length > 0 && (
              <Card>
                <h2 className="font-display font-semibold text-base text-white mb-4">Categorias</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {event.categories.map((cat) => (
                    <div key={cat} className="flex items-center justify-between p-3 rounded-[5px] border border-zinc-800 bg-zinc-900/50">
                      <div className="flex items-center gap-2">
                        <Flag className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-sm font-medium text-zinc-200">{cat}</span>
                      </div>
                      <span className="font-mono text-xs text-zinc-500">R$ {event.entryFee}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Schedule */}
            {event.schedule.length > 0 && (
              <Card>
                <h2 className="font-display font-semibold text-base text-white mb-4">Programação</h2>
                <div className="space-y-5">
                  {days.map((day) => (
                    <div key={day}>
                      <p className="text-[11px] font-mono text-zinc-600 uppercase mb-2">Dia {day}</p>
                      <div className="space-y-2">
                        {event.schedule
                          .filter((s) => s.day === day)
                          .map((item) => (
                            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-zinc-800/60 last:border-0">
                              <span className="font-mono text-xs text-zinc-500 w-12 flex-shrink-0">{item.startTime}</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${SCHEDULE_COLORS[item.type]}`}>
                                {SCHEDULE_LABELS[item.type]}
                              </span>
                              <span className="text-sm text-zinc-300 flex-1">{item.title}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Sponsors */}
            {event.sponsors.length > 0 && (
              <Card>
                <h2 className="font-display font-semibold text-base text-white mb-4">Patrocinadores</h2>
                <div className="flex flex-wrap gap-2">
                  {event.sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="px-4 py-2 border border-zinc-800 rounded-[4px] text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors">
                      {sponsor.name}
                      {sponsor.tier && <Badge variant="ghost" size="sm" className="ml-2 capitalize">{sponsor.tier}</Badge>}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Registration Card */}
            <Card glow={isOpen} className="sticky top-20">
              <div className="mb-4">
                <p className="text-[10px] font-mono text-zinc-600 uppercase mb-1">Taxa de Inscrição</p>
                <p className="font-display font-extrabold text-3xl text-white">
                  R$ {event.entryFee.toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Vagas preenchidas</span>
                  <span className="font-mono text-zinc-300">{event.registeredPilots}/{event.maxPilots}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${fillPct}%`,
                      background: fillPct > 90 ? "#ef4444" : fillPct > 70 ? "#f59e0b" : "#e11d48",
                    }}
                  />
                </div>
              </div>

              {daysToDeadline > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-400 mb-4 p-2 rounded-[4px] bg-amber-950/30 border border-amber-900/50">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{daysToDeadline} dias para o prazo de inscrição</span>
                </div>
              )}

              <Button
                variant={isOpen ? "primary" : "outline"}
                size="lg"
                fullWidth
                disabled={!isOpen}
                onClick={() => navigate(`/eventos/${event.slug}`)}
              >
                {isOpen ? "Inscrever-se agora" : event.eventStatus === "finished" ? "Resultados" : "Em breve"}
              </Button>

              <div className="mt-3 space-y-2">
                {["Confirmação imediata por e-mail", "Pagamento via Pix, cartão ou boleto", "Cancelamento até 7 dias antes"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-zinc-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Deadline */}
            {event.registrationClose && (
              <Card>
                <p className="text-[10px] font-mono text-zinc-600 uppercase mb-2">Prazo de Inscrição</p>
                <p className="font-display font-bold text-base text-white">
                  {format(new Date(event.registrationClose), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </Card>
            )}

            {/* QR Download */}
            <Card className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-zinc-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-300">QR Code do Evento</p>
                <p className="text-xs text-zinc-600">Para divulgação nas redes sociais</p>
              </div>
              <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>Baixar</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
