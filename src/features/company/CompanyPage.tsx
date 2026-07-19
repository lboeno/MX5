import { Link } from "react-router-dom";
import {
  MapPin, Trophy, Flag, Users, Calendar, Shield, Zap,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ROUTES } from "../../lib/routes";

const STATS = [
  { label: "Eventos realizados", value: "120+", icon: Calendar },
  { label: "Pilotos ativos", value: "1.8k", icon: Users },
  { label: "Cidades atendidas", value: "40+", icon: MapPin },
  { label: "Anos de tradição", value: "08", icon: Trophy },
];

const PILLARS = [
  {
    icon: Flag,
    title: "Gestão completa de eventos",
    text: "Crie, divulgue e gerencie campeonatos de motocross em um só lugar — da inscrição à cronometragem.",
  },
  {
    icon: Shield,
    title: "Inscrições seguras",
    text: "Cadastro de pilotos com validação de documentos, acompanhamento de pagamento e status em tempo real.",
  },
  {
    icon: Zap,
    title: "Experiência para os fãs",
    text: "Calendário, rankings e resultados atualizados para quem acompanha a categoria de perto.",
  },
];

export function CompanyPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <section className="text-center py-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            A plataforma definitiva do motocross no Brasil
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground">
            Sobre a <span className="text-rose-500">PortalMX</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            Somos a plataforma que conecta organizadores, pilotos e fãs do motocross.
            Do cadastro à largada, simplificamos a gestão de eventos para que o foco
            continue sendo a pista.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="primary" size="lg" onClick={() => (window.location.href = "/eventos")}>
              Ver eventos
            </Button>
            <Link to={ROUTES.REGISTER}>
              <Button variant="outline" size="lg">Quero me cadastrar</Button>
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-10">
          {STATS.map((s) => (
            <Card key={s.label} padding="md" className="text-center">
              <s.icon className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <p className="font-display font-bold text-2xl text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
            </Card>
          ))}
        </section>

        {/* Mission */}
        <section className="my-10">
          <h2 className="font-display font-bold text-2xl text-foreground mb-4">Nossa missão</h2>
          <p className="text-muted-foreground leading-relaxed">
            Tornar a organização de campeonatos de motocross mais profissional e acessível.
            Acreditamos que tecnologia bem aplicada tira o trabalho burocrático das mãos de
            quem vive o esporte e devolve tempo para o que importa: competir e se divertir.
          </p>
        </section>

        {/* Pillars */}
        <section className="my-10">
          <h2 className="font-display font-bold text-2xl text-foreground mb-4">O que fazemos</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {PILLARS.map((p) => (
              <Card key={p.title} padding="lg">
                <p.icon className="w-7 h-7 text-rose-500 mb-3" />
                <h3 className="font-display font-semibold text-base text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="my-10 rounded-[10px] border border-border bg-muted/40 p-8 text-center">
          <h2 className="font-display font-bold text-xl text-foreground mb-2">
            Pronto para levar seu evento a sério?
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Cadastre seu piloto ou organize sua próxima etapa com a PortalMX.
          </p>
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" size="lg">Começar agora</Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
