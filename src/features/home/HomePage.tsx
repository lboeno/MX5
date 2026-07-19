import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Trophy, ChevronRight, Play, Shield, Zap, Flag, TrendingUp,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { getUpcomingEvents } from "../../services/events";
import { fetchNews } from "../../services/news";
import type { EventSummary } from "../../types/events";
import type { NewsArticle } from "../../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const FEATURES = [
  { icon: Zap, title: "Inscrições Instantâneas", desc: "Inscrição em menos de 60 segundos com pagamento via Pix, cartão ou Mercado Pago.", color: "text-amber-400" },
  { icon: Trophy, title: "Rankings Automáticos", desc: "Pontuação calculada em tempo real com critérios de desempate configuráveis.", color: "text-rose-400" },
  { icon: Shield, title: "Documentos Seguros", desc: "Armazenamento criptografado de licenças, apólices e atestados médicos.", color: "text-blue-400" },
  { icon: TrendingUp, title: "Analytics Avançados", desc: "Dashboards financeiros completos para organizadores e federações.", color: "text-emerald-400" },
];

const SPONSOR_SLOTS = [
  "Patrocinador",
  "Parceiro Oficial",
  "Patrocinador",
  "Parceiro Oficial",
  "Patrocinador",
  "Parceiro Oficial",
];

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function EventStatusBadge({ status }: { status: string }) {
  if (status === "upcoming") return <Badge variant="info" dot>Em breve</Badge>;
  if (status === "registration_open") return <Badge variant="success" dot>Inscrições abertas</Badge>;
  if (status === "running") return <Badge variant="warning" dot>Em andamento</Badge>;
  if (status === "finished") return <Badge variant="default">Encerrado</Badge>;
  if (status === "cancelled") return <Badge variant="danger">Cancelado</Badge>;
  return <Badge variant="warning">{status}</Badge>;
}

export function HomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventSummary[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    let active = true;
    getUpcomingEvents(3)
      .then((data) => { if (active) setUpcomingEvents(data); })
      .catch((err) => { console.error("[Home] Erro ao carregar eventos:", err); })
      .finally(() => { if (active) setEventsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetchNews({ status: "published", featured: true })
      .then((data) => { if (active) setFeaturedNews(data.slice(0, 3)); })
      .catch((err) => { console.error("[Home] Erro ao carregar notícias:", err); });
    return () => { active = false; };
  }, []);

  const nextEventDate = upcomingEvents[0]?.startDate;

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(225,29,72,0.15) 0%, transparent 60%)",
          }}
        />
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&auto=format"
          alt="Motocross"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06]"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-16 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            >
              <motion.div variants={fade} className="mb-6">
                <Badge variant="outline" dot>
                  <span className="text-rose-400">Novo</span>
                  &nbsp;Temporada 2025 em andamento
                </Badge>
              </motion.div>

              <motion.h1
                variants={fade}
                className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight mb-6"
              >
                A plataforma do{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
                  motocross
                </span>{" "}
                brasileiro
              </motion.h1>

              <motion.p variants={fade} className="text-zinc-400 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
                Gestão completa de eventos, pilotos, campeonatos e pagamentos.
                Do cadastro ao pódio, tudo em um só lugar — para organizadores, federações e pilotos.
              </motion.p>

              <motion.div variants={fade} className="flex flex-wrap gap-3">
                <Link to="/eventos">
                  <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
                    Ver Eventos
                  </Button>
                </Link>
                <Link to="/registrar">
                  <Button variant="outline" size="lg" icon={<Play className="w-4 h-4" />}>
                    Criar Conta
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sponsors Banner — marquee animado (sem dados de exemplo) */}
      <section className="border-y border-zinc-800/60 bg-zinc-900/20 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-3">
          <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest text-center">Patrocinadores & Parceiros Oficiais</p>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-zinc-900/20 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-zinc-900/20 to-transparent z-10" />
          <div className="flex w-max animate-[marquee_22s_linear_infinite] gap-6 px-4">
            {Array.from({ length: 2 }).map((_, pass) => (
              <div key={pass} className="flex gap-6 flex-shrink-0" aria-hidden={pass === 1}>
                {SPONSOR_SLOTS.map((name, i) => (
                  <div
                    key={`${pass}-${i}`}
                    className="flex-shrink-0 w-40 h-16 rounded-[6px] border border-zinc-800 bg-zinc-900/40 flex items-center justify-center text-xs font-medium text-zinc-600"
                  >
                    {name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">Próximos Eventos</h2>
            <p className="text-zinc-500 text-sm">Inscreva-se antes do prazo e garanta seu número</p>
          </div>
          <Link to="/eventos">
            <Button variant="ghost" size="sm" iconRight={<ChevronRight className="w-4 h-4" />}>
              Ver todos
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventsLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="h-64 rounded-[8px] bg-zinc-900/50 animate-pulse" />
            ))
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={`/eventos/${event.slug}`}>
                  <Card hover className="h-full flex flex-col overflow-hidden" padding="none">
                    <div className="relative h-40 bg-zinc-900 overflow-hidden">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <EventStatusBadge status={event.eventStatus} />
                      </div>
                      <div className="absolute bottom-3 left-3 font-mono text-xs text-zinc-400">
                        {event.city}, {event.state}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-zinc-100 leading-tight line-clamp-2">{event.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1 font-mono">
                          {format(new Date(event.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {event.categories.slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="outline" size="sm">{cat}</Badge>
                        ))}
                        {event.categories.length > 3 && (
                          <Badge variant="ghost" size="sm">+{event.categories.length - 3}</Badge>
                        )}
                      </div>
                      <div className="mt-auto pt-3 border-t border-zinc-800 flex items-center justify-between">
                        <div>
                          <p className="font-mono text-xs text-zinc-500">{event.registeredPilots}/{event.maxPilots} pilotos</p>
                          <div className="mt-1 h-1 w-28 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-600 rounded-full"
                              style={{ width: `${(event.registeredPilots / Math.max(event.maxPilots, 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-display font-bold text-sm text-white">
                          R$ {event.entryFee.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Flag className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">Nenhum evento disponível no momento.</p>
              <Link to="/eventos" className="mt-2 inline-block text-xs text-rose-500 hover:underline">
                Ver todos os eventos
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-zinc-800 bg-zinc-900/10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-display font-bold text-3xl text-white mb-3">
                Tudo o que você precisa para o campeonato
              </h2>
              <p className="text-zinc-500 text-sm mb-8">
                Da inscrição ao pódio, o Portal MX automatiza a gestão de eventos, pilotos e pagamentos.
              </p>

              <Link to="/rankings" className="inline-block mt-4">
                <Button variant="outline" size="sm" iconRight={<ChevronRight className="w-4 h-4" />}>
                  Ver classificações
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="flex flex-col gap-3">
                    <div className={`w-8 h-8 rounded-[5px] bg-zinc-800 flex items-center justify-center ${feature.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-semibold text-sm text-zinc-100">{feature.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">Últimas Notícias</h2>
            <p className="text-zinc-500 text-sm">Cobertura completa do motocross nacional</p>
          </div>
          <Link to="/noticias">
            <Button variant="ghost" size="sm" iconRight={<ChevronRight className="w-4 h-4" />}>Ver todas</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {featuredNews.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover padding="none" className="overflow-hidden h-full flex flex-col">
                <div className="h-44 bg-zinc-900 relative overflow-hidden">
                  <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111113] to-transparent" />
                </div>
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="sm">
                      {article.category === "race_report" ? "Relatório" : article.category === "interview" ? "Entrevista" : "Notícia"}
                    </Badge>
                    <span className="text-[11px] text-zinc-600 font-mono">
                      {format(new Date(article.publishedAt), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-sm text-zinc-100 leading-snug line-clamp-3 flex-1">{article.title}</h3>
                  <p className="text-xs text-zinc-600">{article.author}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800 bg-gradient-to-br from-zinc-900 to-[#09090b] py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6">Para Organizadores</Badge>
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Gerencie seu campeonato com{" "}
            <span className="text-rose-500">confiança</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-8">
            Mais de 80 organizadores usam o Portal MX para automatizar inscrições, pagamentos e rankings de seus eventos.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/registrar">
              <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
                Começar gratuitamente
              </Button>
            </Link>
            <Link to="/eventos">
              <Button variant="outline" size="lg">
                Ver demonstração
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
