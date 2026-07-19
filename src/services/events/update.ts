import { supabase } from "../../lib/supabase";
import type { EventFormData, EventDetail } from "../../types/events";
import { getEventBySlug } from "./fetch";

export async function updateEvent(
  id: string,
  data: Partial<EventFormData>
): Promise<EventDetail> {
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle ?? null;
  if (data.description !== undefined) updateData.description = data.description ?? null;
  if (data.championshipId !== undefined) updateData.championship_id = data.championshipId ?? null;
  if (data.trackId !== undefined) updateData.track_id = data.trackId ?? null;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.startDate !== undefined) updateData.start_date = data.startDate;
  if (data.endDate !== undefined) updateData.end_date = data.endDate;
  if (data.registrationOpen !== undefined) updateData.registration_open = data.registrationOpen ?? null;
  if (data.registrationClose !== undefined) updateData.registration_close = data.registrationClose ?? null;
  if (data.entryFee !== undefined) updateData.entry_fee = data.entryFee;
  if (data.maxPilots !== undefined) updateData.max_pilots = data.maxPilots;
  if (data.eventStatus !== undefined) updateData.event_status = data.eventStatus;
  if (data.isFeatured !== undefined) updateData.is_featured = data.isFeatured;

  updateData.updated_at = new Date().toISOString();

  const { data: event, error } = await supabase
    .from("events")
    .update(updateData)
    .eq("id", id)
    .select("slug")
    .single();

  if (error) throw error;

  // Update categories: delete all, re-insert
  if (data.categories !== undefined) {
    await supabase.from("event_categories").delete().eq("event_id", id);

    if (data.categories.length > 0) {
      const { data: catRows } = await supabase
        .from("categories")
        .select("id, name")
        .in("name", data.categories);

      if (catRows) {
        await supabase.from("event_categories").insert(
          catRows.map((c) => ({ event_id: id, category_id: c.id }))
        );
      }
    }
  }

  // Update schedule: delete all, re-insert
  if (data.schedule !== undefined) {
    await supabase.from("event_schedule").delete().eq("event_id", id);

    if (data.schedule.length > 0) {
      await supabase.from("event_schedule").insert(
        data.schedule.map((s) => ({
          event_id: id,
          day: s.day,
          start_time: s.startTime,
          end_time: s.endTime ?? null,
          title: s.title,
          description: s.description ?? null,
          type: s.type,
        }))
      );
    }
  }

  // Update sponsors: delete all, re-insert
  if (data.sponsors !== undefined) {
    await supabase.from("event_sponsors").delete().eq("event_id", id);

    if (data.sponsors.length > 0) {
      await supabase.from("event_sponsors").insert(
        data.sponsors.map((s) => ({
          event_id: id,
          name: s.name,
          logo: s.logo ?? null,
          website: s.website ?? null,
          tier: s.tier ?? null,
        }))
      );
    }
  }

  const updated = await getEventBySlug(event.slug);
  if (!updated) throw new Error("Evento atualizado mas não encontrado");
  return updated;
}
