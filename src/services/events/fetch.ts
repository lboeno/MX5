import { supabase } from "../../lib/supabase";
import type { EventSummary, EventDetail, ScheduleItem, Sponsor } from "../../types/events";

function mapEvent(row: any, catNames: string[], registeredCount: number, champName?: string): EventSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    city: row.city,
    state: row.state,
    coverImage: row.cover_image ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    entryFee: Number(row.entry_fee ?? 0),
    maxPilots: row.max_pilots ?? 0,
    registeredPilots: registeredCount,
    categories: catNames,
    publicationStatus: row.publication_status,
    eventStatus: row.event_status,
    isFeatured: row.is_featured ?? false,
    championshipName: champName,
  };
}

async function getCategoriesForEvent(eventId: string): Promise<string[]> {
  const { data } = await supabase
    .from("event_categories")
    .select("categories(name)")
    .eq("event_id", eventId);

  if (!data) return [];
  return data.map((r: any) => r.categories?.name).filter(Boolean);
}

async function getRegisteredCount(eventId: string): Promise<number> {
  const { count } = await supabase
    .from("pilot_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  return count ?? 0;
}

export async function getUpcomingEvents(limit = 6): Promise<EventSummary[]> {
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("publication_status", "published")
    .in("event_status", ["upcoming", "registration_open"])
    .is("deleted_at", null)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (!data || data.length === 0) return [];

  const results = await Promise.all(
    data.map(async (row) => {
      const [cats, registered] = await Promise.all([
        getCategoriesForEvent(row.id),
        getRegisteredCount(row.id),
      ]);
      return mapEvent(row, cats, registered);
    })
  );

  return results;
}

export async function getFeaturedEvents(): Promise<EventSummary[]> {
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("publication_status", "published")
    .eq("is_featured", true)
    .is("deleted_at", null)
    .order("start_date", { ascending: true })
    .limit(3);

  if (!data || data.length === 0) return [];

  return Promise.all(
    data.map(async (row) => {
      const [cats, registered] = await Promise.all([
        getCategoriesForEvent(row.id),
        getRegisteredCount(row.id),
      ]);
      return mapEvent(row, cats, registered);
    })
  );
}

export async function fetchEvents(filters?: {
  status?: string;
  search?: string;
}): Promise<EventSummary[]> {
  let query = supabase
    .from("events")
    .select("*")
    .eq("publication_status", "published")
    .is("deleted_at", null);

  if (filters?.status && filters.status !== "all") {
    query = query.eq("event_status", filters.status);
  }

  query = query.order("start_date", { ascending: true });

  const { data } = await query;

  if (!data || data.length === 0) return [];

  let filtered = data;

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = data.filter(
      (r) => r.title.toLowerCase().includes(s) || r.city.toLowerCase().includes(s)
    );
  }

  return Promise.all(
    filtered.map(async (row) => {
      const [cats, registered] = await Promise.all([
        getCategoriesForEvent(row.id),
        getRegisteredCount(row.id),
      ]);
      return mapEvent(row, cats, registered);
    })
  );
}

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  const { data: rows } = await supabase
    .from("events")
    .select("*, championships(name), tracks(*)")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (!rows) return null;

  const row = rows;

  const [categories, schedule, sponsors, registered] = await Promise.all([
    getCategoriesForEvent(row.id),
    supabase.from("event_schedule").select("*").eq("event_id", row.id).order("day").order("start_time"),
    supabase.from("event_sponsors").select("*").eq("event_id", row.id),
    getRegisteredCount(row.id),
  ]);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    description: row.description ?? undefined,
    championship: row.championships
      ? { id: row.championships.id, name: row.championships.name, slug: row.championships.slug, season: row.championships.season }
      : undefined,
    track: row.tracks
      ? { id: row.tracks.id, name: row.tracks.name, city: row.tracks.city, state: row.tracks.state }
      : undefined,
    city: row.city,
    state: row.state,
    coverImage: row.cover_image ?? undefined,
    bannerImage: row.banner_image ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    registrationOpen: row.registration_open ?? undefined,
    registrationClose: row.registration_close ?? undefined,
    entryFee: Number(row.entry_fee ?? 0),
    maxPilots: row.max_pilots ?? 0,
    registeredPilots: registered,
    categories,
    schedule: (schedule.data ?? []).map((s: any): ScheduleItem => ({
      id: s.id,
      day: s.day,
      startTime: s.start_time,
      endTime: s.end_time ?? undefined,
      title: s.title,
      description: s.description ?? undefined,
      type: s.type,
    })),
    sponsors: (sponsors.data ?? []).map((s: any): Sponsor => ({
      id: s.id,
      name: s.name,
      logo: s.logo ?? undefined,
      website: s.website ?? undefined,
      tier: s.tier ?? undefined,
    })),
    publicationStatus: row.publication_status,
    eventStatus: row.event_status,
    isFeatured: row.is_featured ?? false,
    createdAt: row.created_at,
  };
}

export async function getEvent(id: string): Promise<EventDetail | null> {
  const { data: rows } = await supabase
    .from("events")
    .select("*, championships(name), tracks(*)")
    .eq("id", id)
    .maybeSingle();

  if (!rows) return null;
  return getEventBySlug(rows.slug);
}

export async function fetchAllEvents(filters?: {
  status?: string;
  search?: string;
  publicationStatus?: string;
}): Promise<EventSummary[]> {
  let query = supabase
    .from("events")
    .select("*")
    .is("deleted_at", null);

  if (filters?.publicationStatus && filters.publicationStatus !== "all") {
    query = query.eq("publication_status", filters.publicationStatus);
  }
  if (filters?.status && filters.status !== "all") {
    query = query.eq("event_status", filters.status);
  }

  query = query.order("start_date", { ascending: false });

  const { data } = await query;
  if (!data || data.length === 0) return [];

  let filtered = data;
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = data.filter((r) => r.title.toLowerCase().includes(s));
  }

  return Promise.all(
    filtered.map(async (row) => {
      const [cats, registered] = await Promise.all([
        getCategoriesForEvent(row.id),
        getRegisteredCount(row.id),
      ]);
      return mapEvent(row, cats, registered);
    })
  );
}
