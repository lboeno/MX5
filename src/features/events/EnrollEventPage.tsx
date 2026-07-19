import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2, AlertTriangle, Loader2, ArrowLeft, FileText, Bike, Users, Tag,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { fetchMyPilot } from "../../lib/pilots";
import type { Pilot } from "../../types";
import { getEventBySlug } from "../../services/events";
import {
  enrollPilotInEvent,
  getMyRegistrationForEvent,
} from "../../services/registrations";
import { ROUTES } from "../../lib/routes";
import type { EventDetail, EventRegistration } from "../../types/events";
import { isEnrollmentOpen } from "../../types/events";

type Phase =
  | "loading"
  | "closed"
  | "not_logged"
  | "incomplete"
  | "already"
  | "review"
  | "submitting"
  | "success";

function isPilotComplete(p: Pilot | null): boolean {
  if (!p) return false;
  return Boolean(
    p.name &&
      p.number &&
      p.category &&
      p.emergencyContact?.name &&
      p.emergencyContact?.phone
  );
}

export function EnrollEventPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [phase, setPhase] = useState<Phase>("loading");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [confirmData, setConfirmData] = useState(false);
  const [confirmRules, setConfirmRules] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!slug) return;

    const load = async () => {
      try {
        const ev = await getEventBySlug(slug);
        if (!active) return;
        if (!ev) {
          setPhase("closed");
          return;
        }
        setEvent(ev);

        if (!isAuthenticated || !user) {
          setPhase("not_logged");
          return;
        }

        const myPilot = await fetchMyPilot();
        if (!active) return;
        setPilot(myPilot);

        const existing = await getMyRegistrationForEvent(ev.id);
        if (!active) return;

        if (existing) {
          setRegistration(existing);
          setPhase("already");
          return;
        }

        if (!isPilotComplete(myPilot)) {
          setPhase("incomplete");
          return;
        }

        setPhase(isEnrollmentOpen(ev.eventStatus) ? "review" : "closed");
      } catch (err) {
        if (!active) return;
        console.error("[EnrollEvent] erro:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar inscrição.");
        setPhase("closed");
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [slug, isAuthenticated, user]);

  const handleConfirm = async () => {
    if (!event || !confirmData || !confirmRules) return;
    setPhase("submitting");
    setError(null);
    try {
      const created = await enrollPilotInEvent(event.id);
      setRegistration(created);
      setPhase("success");
    } catch (err) {
      console.error("[EnrollEvent] falha:", err);
      setError(err instanceof Error ? err.message : "Não foi possível concluir a inscrição.");
      setPhase("review");
    }
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (phase === "closed") {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card padding="lg">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h1 className="font-display font-bold text-lg text-foreground mb-2">Inscrições indisponíveis</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {error ?? "As inscrições para este evento não estão abertas no momento."}
            </p>
            <Button variant="outline" size="md" onClick={() => navigate(-1)}>Voltar</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "not_logged") {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card padding="lg">
            <Users className="w-10 h-10 text-rose-500 mx-auto mb-4" />
            <h1 className="font-display font-bold text-lg text-foreground mb-2">Faça login para se inscrever</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Você precisa estar logado para se inscrever em um evento.
            </p>
            <Button variant="primary" size="md" onClick={() => navigate(`/login?redirect=/eventos/${slug}/inscrever`)}>
              Entrar
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "incomplete") {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card padding="lg">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h1 className="font-display font-bold text-lg text-foreground mb-2">Cadastro incompleto</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Complete seu perfil de piloto (nome, número, categoria e contato de emergência)
              antes de se inscrever em um evento.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="md" onClick={() => navigate(ROUTES.PILOT)}>Meu Perfil</Button>
              <Button variant="outline" size="md" onClick={() => navigate(-1)}>Voltar</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "already" && registration) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card padding="lg">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
            <h1 className="font-display font-bold text-lg text-foreground mb-2">Você já está inscrito</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Inscrição <span className="font-mono text-foreground">{registration.registrationNumber}</span> neste evento.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="md" onClick={() => navigate(ROUTES.PILOT)}>Meu Perfil</Button>
              <Button variant="outline" size="md" onClick={() => navigate("/eventos")}>Ver eventos</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "success" && registration) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card padding="lg">
            <div className="w-20 h-20 rounded-full bg-emerald-900/30 border border-emerald-700 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground mb-2">Inscrição Realizada!</h1>
            <p className="text-sm text-muted-foreground mb-6">Sua inscrição foi enviada com sucesso.</p>

            <div className="bg-muted rounded-[8px] p-4 mb-4 text-left">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Inscrição</p>
                <p className="font-display font-bold text-lg text-rose-500">{registration.registrationNumber}</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Status</p>
                <p className="flex items-center gap-2 text-sm text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Aguardando análise
                </p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mb-6">
              Enviamos uma confirmação para seu e-mail.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/eventos/${slug}`)}
              >
                Ir para eventos
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => navigate("/")}
              >
                Ir para home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const moto = pilot?.motorcycle;
  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to={`/eventos/${slug}`} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao evento
        </Link>

        <h1 className="font-display font-bold text-2xl text-foreground mb-1">Inscrição no evento</h1>
        <p className="text-sm text-muted-foreground mb-6">{event?.title}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-[6px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-300">{error}</span>
          </div>
        )}

        <Card padding="lg" className="mb-4">
          <h2 className="font-display font-semibold text-base text-foreground mb-4">Confirme seus dados</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <DataRow icon={<Users className="w-4 h-4 text-rose-400" />} label="Nome" value={pilot?.name ?? "—"} />
            <DataRow icon={<Tag className="w-4 h-4 text-rose-400" />} label="Número" value={pilot?.number ?? "—"} />
            <DataRow icon={<Tag className="w-4 h-4 text-rose-400" />} label="Categoria" value={pilot?.category ?? "—"} />
            <DataRow icon={<Users className="w-4 h-4 text-rose-400" />} label="Equipe" value={pilot?.team ?? "—"} />
            <div className="sm:col-span-2">
              <DataRow
                icon={<Bike className="w-4 h-4 text-rose-400" />}
                label="Moto"
                value={moto?.brand ? `${moto.brand} ${moto.model ?? ""} ${moto.year ?? ""}`.trim() : "—"}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Os dados são os do seu perfil e não podem ser alterados aqui.
          </p>
        </Card>

        <Card padding="lg" className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={confirmData}
              onChange={(e) => setConfirmData(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-rose-600"
            />
            <span className="text-sm text-foreground">Confirmo que meus dados estão corretos.</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmRules}
              onChange={(e) => setConfirmRules(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-rose-600"
            />
            <span className="text-sm text-foreground">Aceito o regulamento do evento.</span>
          </label>
        </Card>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!confirmData || !confirmRules}
          loading={phase === "submitting"}
          onClick={handleConfirm}
        >
          Confirmar inscrição
        </Button>
      </div>
    </div>
  );
}

function DataRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-[5px] border border-border bg-muted/40">
      <div className="w-8 h-8 rounded-[4px] bg-muted flex items-center justify-center flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground/70 font-mono uppercase">{label}</p>
        <p className="text-sm text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
