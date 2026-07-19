// Pure domain logic for registration journey state.
// No React / Supabase dependency — reusable by Admin, Pilot area, API, Edge Functions.
//
// Sync with:
//   - supabase/migrations/013_event_registration_flow.sql (current_step CHECK)
//   - src/types/events.ts (CurrentStep, PaymentStatus)

import type { PaymentStatus } from "../../types/events";

export const STEP_ORDER = [
  "registration",
  "review",
  "payment",
  "approved",
  "checkin",
  "racing",
  "finished",
] as const;

export type CurrentStep = (typeof STEP_ORDER)[number];

export const STEP_LABELS: Record<CurrentStep, string> = {
  registration: "Inscrição enviada",
  review: "Em análise",
  payment: "Pagamento",
  approved: "Homologado",
  checkin: "Check-in",
  racing: "Corrida",
  finished: "Resultado",
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: "Pagamento pendente",
  paid: "Pago",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
  na: "Sem pagamento",
};

export function nextStep(step: CurrentStep): CurrentStep | null {
  const i = STEP_ORDER.indexOf(step);
  if (i < 0 || i >= STEP_ORDER.length - 1) return null;
  return STEP_ORDER[i + 1];
}

export function previousStep(step: CurrentStep): CurrentStep | null {
  const i = STEP_ORDER.indexOf(step);
  if (i <= 0) return null;
  return STEP_ORDER[i - 1];
}

export function canTransition(from: CurrentStep, to: CurrentStep): boolean {
  const fromIdx = STEP_ORDER.indexOf(from);
  const toIdx = STEP_ORDER.indexOf(to);
  if (fromIdx < 0 || toIdx < 0) return false;
  // Only forward by exactly one step is allowed (linear journey).
  return toIdx === fromIdx + 1;
}
