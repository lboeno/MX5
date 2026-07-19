import { supabase } from "../../lib/supabase";
import type { EventDetail } from "../../types/events";
import { getEvent } from "./fetch";
import { createEvent } from "./create";
import type { EventFormData } from "../../types/events";

export async function publishEvent(id: string): Promise<EventDetail> {
  const { error } = await supabase
    .from("events")
    .update({ publication_status: "published", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;

  const event = await getEvent(id);
  if (!event) throw new Error("Evento não encontrado após publicação");
  return event;
}

export async function unpublishEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from("events")
    .update({ publication_status: "draft", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function archiveEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from("events")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function cancelEvent(id: string): Promise<EventDetail> {
  const { error } = await supabase
    .from("events")
    .update({
      event_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  const event = await getEvent(id);
  if (!event) throw new Error("Evento não encontrado após cancelamento");
  return event;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_event", { p_event_id: id });
  if (error) throw error;
}

export async function duplicateEvent(id: string, userId: string): Promise<EventDetail> {
  const original = await getEvent(id);
  if (!original) throw new Error("Evento original não encontrado");

  const formData: EventFormData = {
    title: `${original.title} (cópia)`,
    subtitle: original.subtitle,
    description: original.description,
    city: original.city,
    state: original.state,
    startDate: original.startDate,
    endDate: original.endDate,
    registrationOpen: original.registrationOpen,
    registrationClose: original.registrationClose,
    entryFee: original.entryFee,
    maxPilots: original.maxPilots,
    eventStatus: "upcoming",
    isFeatured: false,
    categories: original.categories,
    schedule: original.schedule.map((s) => ({
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      title: s.title,
      description: s.description,
      type: s.type,
    })),
    sponsors: original.sponsors.map((s) => ({
      name: s.name,
      logo: s.logo,
      website: s.website,
      tier: s.tier,
    })),
  };

  return createEvent(formData, userId);
}
