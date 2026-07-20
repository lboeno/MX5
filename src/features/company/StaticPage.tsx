import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, Users, Handshake, Shield, Newspaper } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ROUTES } from "../../lib/routes";

type Section =
  | "sobre"
  | "blog"
  | "parceiros"
  | "termos"
  | "privacidade"
  | "contato";

const META: Record<Section, { title: string; subtitle: string }> = {
  sobre: {
    title: "Sobre a PortalMX",
    subtitle: "Conheça a plataforma que move o motocross brasileiro.",
  },
  blog: {
    title: "Blog PortalMX",
    subtitle: "Novidades, bastidores e análises do mundo das duas rodas.",
  },
  parceiros: {
    title: "Parceiros",
    subtitle: "Marcas e organizações que aceleram o esporte conosco.",
  },
  termos: {
    title: "Termos de Uso",
    subtitle: "Condições para utilização da plataforma PortalMX.",
  },
  privacidade: {
    title: "Política de Privacidade",
    subtitle: "Como coletamos, usamos e protegemos seus dados.",
  },
  contato: {
    title: "Contato",
    subtitle: "Fale com a equipe PortalMX.",
  },
};

function SectionBody({ section }: { section: Section }) {
  switch (section) {
    case "sobre":
      return (
        <div className="space-y-8">
          <section>
            <h2 className="font-display font-bold text-xl text-foreground mb-3">Nossa missão</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tornar a organização de campeonatos de motocross mais profissional e acessível,
              conectando organizadores, pilotos e fãs em uma única plataforma.
            </p>
          </section>
          <section>
            <h2 className="font-display font-bold text-xl text-foreground mb-3">Nossa história</h2>
            <p className="text-muted-foreground leading-relaxed">
              A PortalMX nasceu da dor de quem organiza provas no papel e planilhas.
              Crescemos junto com a comunidade e hoje somos referência na gestão de eventos
              de motocross no Brasil.
            </p>
          </section>
          <section>
            <h2 className="font-display font-bold text-xl text-foreground mb-3">Valores</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Shield, t: "Transparência", d: "Dados e resultados claros para todos." },
                { icon: Users, t: "Comunidade", d: "O esporte antes de tudo." },
                { icon: Handshake, t: "Parceria", d: "Crescemos com nossos organizadores." },
              ].map((v) => (
                <Card key={v.t} padding="lg">
                  <v.icon className="w-6 h-6 text-rose-500 mb-2" />
                  <h3 className="font-display font-semibold text-foreground mb-1">{v.t}</h3>
                  <p className="text-sm text-muted-foreground">{v.d}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      );
    case "blog":
      return (
        <div className="rounded-[10px] border border-border bg-muted/40 p-10 text-center">
          <Newspaper className="w-8 h-8 text-muted-foreground/70 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Novos artigos em breve. Volte em outro momento!</p>
        </div>
      );
    case "parceiros":
      return (
        <div className="grid sm:grid-cols-3 gap-4">
          {["MX Parts", "Volt Energy", "Arena Track", "Dirt Brasil", "ProMoto", "Liga MX"].map((p) => (
            <Card key={p} padding="lg" className="text-center">
              <div className="w-12 h-12 rounded-full bg-rose-900/30 border border-rose-700 flex items-center justify-center mx-auto mb-3">
                <Handshake className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-sm font-medium text-foreground">{p}</p>
            </Card>
          ))}
        </div>
      );
    case "termos":
      return (
        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-base text-foreground mb-1">1. Uso da plataforma</h2>
            <p>A PortalMX disponibiliza ferramentas para gestão de eventos de motocross. O uso é pessoal e instransferível.</p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-base text-foreground mb-1">2. Cadastro e contas</h2>
            <p>O usuário é responsável pela veracidade dos dados e pela segurança de sua conta.</p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-base text-foreground mb-1">3. Inscrições e pagamentos</h2>
            <p>As inscrições seguem as regras de cada evento. Pagamentos são processados por intermediadores parceiros.</p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-base text-foreground mb-1">4. Cancelamento</h2>
            <p>Cancelamentos obedecem ao prazo informado em cada evento, sujeitos a políticas de reembolso.</p>
          </section>
        </div>
      );
    case "privacidade":
      return (
        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-base text-foreground mb-1">Coleta de dados</h2>
            <p>Coletamos dados de cadastro, documentos e uso da plataforma para viabilizar as inscrições.</p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-base text-foreground mb-1">Uso das informações</h2>
            <p>Utilizamos os dados para operar eventos, comunicar status e melhorar a experiência.</p>
          </section>
          <section>
            <h2 className="font-display font-semibold text-base text-foreground mb-1">Seus direitos</h2>
            <p>Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento.</p>
          </section>
        </div>
      );
    case "contato":
      return (
        <div className="grid sm:grid-cols-2 gap-4">
          <Card padding="lg" className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">E-mail</p>
              <p className="text-sm text-muted-foreground">contato@portalmx.com.br</p>
            </div>
          </Card>
          <Card padding="lg" className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Telefone</p>
              <p className="text-sm text-muted-foreground">(11) 4002-8922</p>
            </div>
          </Card>
          <Card padding="lg" className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Endereço</p>
              <p className="text-sm text-muted-foreground">São Paulo, SP — Brasil</p>
            </div>
          </Card>
          <Card padding="lg" className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Atendimento</p>
              <p className="text-sm text-muted-foreground">Seg a Sex, 9h às 18h</p>
            </div>
          </Card>
        </div>
      );
    default:
      return null;
  }
}

export function StaticPage({ section }: { section: Section }) {
  const meta = META[section];
  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/empresa" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Empresa
          </Link>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mt-3">
            {meta.title}
          </h1>
          <p className="text-muted-foreground mt-2">{meta.subtitle}</p>
        </div>

        <SectionBody section={section} />

        <div className="mt-10 pt-6 border-t border-border">
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" size="lg">Quero me cadastrar</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
