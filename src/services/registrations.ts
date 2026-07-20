import { supabase } from "../lib/supabase";
import { fetchMyPilot } from "../lib/pilots";
import { toAppCategoryName } from "../lib/categories";
import type { EventRegistration, CurrentStep } from "../types/events";

// --- Helpers ---------------------------------------------------------------

function isPilotComplete(pilot: {
  name?: string;
  number?: string | null;
  category?: string;
  emergencyContact?: { name?: string; phone?: string };
}): boolean {
  return Boolean(
    pilot.name &&
      pilot.number &&
      pilot.category &&
      pilot.emergencyContact?.name &&
      pilot.emergencyContact?.phone
  );
}

// Generates the human-readable registration number.
// Sprint 1: simple MX-<6 digits>. Centralized here so future sequencing
// (MX-2026-000001) requires no UI changes.
function generateRegistrationNumber(): string {
  return `MX-${Date.now().toString().slice(-6)}`;
}

function mapRow(row: any): EventRegistration {
  const pilot = row.pilots ?? {};
  const event = row.events ?? {};
  return {
    id: row.id,
    eventId: row.event_id,
    pilotId: row.pilot_id,
    registrationNumber: row.registration_number ?? undefined,
    status: row.status,
    currentStep: (row.current_step ?? "registration") as CurrentStep,
    paymentStatus: row.payment_status ?? "pending",
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at ?? undefined,
    pilotName: pilot.name ?? "Sem nome",
    pilotNumber: pilot.number ?? "",
    category: toAppCategoryName(pilot.categories?.name ?? pilot.competition_category),
    team: pilot.team_name ?? undefined,
    eventTitle: event.title ?? undefined,
    eventSlug: event.slug ?? undefined,
    eventStart: event.start_date ?? undefined,
    entryFee: event.entry_fee ?? undefined,
  };
}

// --- Service API -----------------------------------------------------------

export async function getMyRegistrationForEvent(
  eventId: string
): Promise<EventRegistration | null> {
  const { data, error } = await supabase
    .from("pilot_registrations")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function enrollPilotInEvent(eventId: string): Promise<EventRegistration> {
  const pilot = await fetchMyPilot();
  if (!pilot) {
    throw new Error("Cadastro incompleto. Complete seu perfil de piloto antes de se inscrever.");
  }
  if (!isPilotComplete(pilot)) {
    throw new Error("Cadastro incompleto. Atualize nome, número, categoria e contato de emergência.");
  }

  const registrationNumber = generateRegistrationNumber();

  const { data, error } = await supabase
    .from("pilot_registrations")
    .insert({
      pilot_id: pilot.id,
      event_id: eventId,
      registration_number: registrationNumber,
      status: "pending",
      current_step: "registration",
      payment_status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function getRegistrationsForEvent(
  eventId: string
): Promise<EventRegistration[]> {
  const { data, error } = await supabase
    .from("pilot_registrations")
    .select("*, pilots(name, number, team_name, categories(name))")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

const REGISTRATION_SELECT =
  "*, pilots(name, number, team_name, categories(name)), events(title, slug, start_date, entry_fee)";

export async function getMyRegistration(
  registrationId: string
): Promise<EventRegistration | null> {
  const { data, error } = await supabase
    .from("pilot_registrations")
    .select(REGISTRATION_SELECT)
    .eq("id", registrationId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function getMyRegistrations(): Promise<EventRegistration[]> {
  const pilot = await fetchMyPilot();
  if (!pilot) return [];
  const { data, error } = await supabase
    .from("pilot_registrations")
    .select(REGISTRATION_SELECT)
    .eq("pilot_id", pilot.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}
