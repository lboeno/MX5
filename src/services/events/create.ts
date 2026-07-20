import { supabase } from "../../lib/supabase";
import type { EventFormData, EventDetail } from "../../types/events";
import { getEventBySlug } from "./fetch";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let attempts = 0;

  while (attempts < 20) {
    const { data } = await supabase.from("events").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    attempts++;
    slug = `${base}-${attempts}`;
  }

  return `${base}-${Date.now()}`;
}

export async function createEvent(
  data: EventFormData,
  userId: string,
  processedImages?: { coverUrl?: string; bannerUrl?: string; galleryUrls?: string[] }
): Promise<EventDetail> {
  const slug = await generateSlug(data.title);

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      slug,
      title: data.title,
      subtitle: data.subtitle ?? null,
      description: data.description ?? null,
      championship_id: data.championshipId ?? null,
      track_id: data.trackId ?? null,
      city: data.city,
      state: data.state,
      address: data.address ?? null,
      organizer: data.organizer ?? null,
      cover_image: processedImages?.coverUrl ?? null,
      banner_image: processedImages?.bannerUrl ?? null,
      start_date: data.startDate,
      end_date: data.endDate,
      registration_open: data.registrationOpen ?? null,
      registration_close: data.registrationClose ?? null,
      entry_fee: data.entryFee,
      max_pilots: data.maxPilots,
      event_status: data.eventStatus,
      is_featured: data.isFeatured,
      publication_status: "published",
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  // Insert categories
  if (data.categories.length > 0) {
    const { data: catRows } = await supabase
      .from("categories")
      .select("id, name")
      .in("name", data.categories);

    if (catRows) {
      const cats = catRows.map((c) => ({ event_id: event.id, category_id: c.id }));
      const { error: catError } = await supabase.from("event_categories").insert(cats);
      if (catError) console.error("[events] Erro ao inserir categorias:", catError);
    }
  }

  // Insert schedule
  if (data.schedule.length > 0) {
    const scheduleRows = data.schedule.map((s) => ({
      event_id: event.id,
      day: s.day,
      start_time: s.startTime,
      end_time: s.endTime ?? null,
      title: s.title,
      description: s.description ?? null,
      type: s.type,
    }));

    const { error: schError } = await supabase.from("event_schedule").insert(scheduleRows);
    if (schError) console.error("[events] Erro ao inserir cronograma:", schError);
  }

  // Insert sponsors
  if (data.sponsors.length > 0) {
    const sponsorRows = data.sponsors.map((s) => ({
      event_id: event.id,
      name: s.name,
      logo: s.logo ?? null,
      website: s.website ?? null,
      tier: s.tier ?? null,
    }));

    const { error: spError } = await supabase.from("event_sponsors").insert(sponsorRows);
    if (spError) console.error("[events] Erro ao inserir patrocinadores:", spError);
  }

  const created = await getEventBySlug(slug);
  if (!created) throw new Error("Evento criado mas não encontrado");
  return created;
}
