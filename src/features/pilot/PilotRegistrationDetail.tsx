import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2, Loader2, ArrowLeft, Calendar, Tag, Users, FileText,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { getMyRegistration } from "../../services/registrations";
import { STEP_LABELS, PAYMENT_LABELS } from "../../domain/registration/stateMachine";
import { ROUTES } from "../../lib/routes";
import type { EventRegistration, CurrentStep, PaymentStatus } from "../../types/events";

const STEP_DESCRIPTION: Partial<Record<CurrentStep, string>> = {
  review: "Análise da inscrição pela organização.",
  payment: "Confirmação do pagamento (quando aplicável).",
  approved: "Homologação da inscrição.",
  checkin: "Liberação para check-in no evento.",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  cancelled: "bg-zinc-500",
  waitlist: "bg-blue-500",
};

const PAYMENT_DOT: Record<PaymentStatus, string> = {
  pending: "bg-amber-500",
  paid: "bg-emerald-500",
  refunded: "bg-blue-500",
  cancelled: "bg-rose-500",
  na: "bg-zinc-500",
};

function RegistrationNextSteps({ currentStep }: { currentStep: CurrentStep }) {
  const steps: CurrentStep[] = ["review", "payment", "approved", "checkin"];
  const currentIdx = steps.indexOf(currentStep);
  return (
    <ul className="space-y-2 text-left">
      {steps.map((step, i) => {
        const done = currentIdx >= 0 && i < currentIdx;
        return (
          <li key={step} className="flex items-start gap-3">
            <span
              className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                done ? "bg-emerald-900/40 border border-emerald-700" : "bg-muted border border-border"
              }`}
            >
              {done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              )}
            </span>
            <div>
              <p className={`text-sm ${done ? "text-foreground/60 line-through" : "text-foreground"}`}>
                {STEP_LABELS[step]}
              </p>
              <p className="text-xs text-muted-foreground">{STEP_DESCRIPTION[step]}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function PilotRegistrationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMyRegistration(id)
      .then(setRegistration)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar inscrição."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card padding="lg">
            <p className="text-sm text-muted-foreground mb-4">{error ?? "Inscrição não encontrada."}</p>
            <Button variant="outline" size="md" onClick={() => navigate(ROUTES.PILOT)}>Voltar ao Perfil</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
      <div className="max-w-2xl mx-auto">
        <Link
          to={ROUTES.PILOT}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Perfil
        </Link>

        <h1 className="font-display font-bold text-2xl text-foreground mb-1">Detalhes da inscrição</h1>
        <p className="text-sm text-muted-foreground mb-6">{registration.eventTitle}</p>

        <Card padding="lg" className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-foreground">Inscrição enviada com sucesso</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Inscrição</p>
              <p className="font-display font-bold text-xl text-rose-500">{registration.registrationNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[registration.status] ?? "bg-muted-foreground"}`} />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                <p className="text-sm text-foreground">{STEP_LABELS[registration.currentStep]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${PAYMENT_DOT[registration.paymentStatus] ?? "bg-muted-foreground"}`} />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Pagamento</p>
                <p className="text-sm text-foreground">{PAYMENT_LABELS[registration.paymentStatus]}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            {registration.eventStart && (
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Calendar className="w-4 h-4 text-rose-400" />
                {new Date(registration.eventStart).toLocaleDateString("pt-BR")}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Tag className="w-4 h-4 text-rose-400" />
              Categoria: {registration.category}
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Users className="w-4 h-4 text-rose-400" />
              Equipe: {registration.team ?? "Independente"}
            </div>
            {typeof registration.entryFee === "number" && (
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <FileText className="w-4 h-4 text-rose-400" />
                Taxa de inscrição: R$ {registration.entryFee.toFixed(2)}
              </div>
            )}
          </div>
        </Card>

        <Card padding="lg" className="mb-6">
          <h2 className="font-display font-semibold text-base text-foreground mb-4">Próximos passos</h2>
          <RegistrationNextSteps currentStep={registration.currentStep} />
        </Card>

        <div className="flex flex-col gap-3">
          {registration.eventSlug && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate(`/eventos/${registration.eventSlug}`)}
            >
              Ver evento
            </Button>
          )}
          <div className="flex gap-3">
            <Button variant="outline" size="md" fullWidth onClick={() => navigate(ROUTES.PILOT)}>
              Meu Perfil
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={() => navigate("/")}>
              Voltar para Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
