import { supabase } from "../../lib/supabase";
import type { RankingsOverview, RankingStanding, RaceResultRow, FilterOption } from "../../types/rankings";
import { aggregateStandings } from "./calculations";

export async function getRankingsOverview(): Promise<RankingsOverview> {
  const [{ count: pilotCount }, { count: catCount }, { data: results }] = await Promise.all([
    supabase.from("pilots").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("race_results")
      .select(`
        pilot_id,
        points,
        pilots!inner(name, number, team_name)
      `)
      .order("points", { ascending: false })
      .limit(1),
  ]);

  const leader = results && results.length > 0
    ? {
        name: (results[0] as any).pilots?.name ?? "—",
        points: Number((results[0] as any).points ?? 0),
        photo: undefined,
      }
    : null;

  return {
    leader,
    totalPilots: pilotCount ?? 0,
    totalCategories: catCount ?? 0,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getChampionshipStandings(
  championshipId?: string,
  categoryId?: string,
  eventId?: string,
): Promise<RankingStanding[]> {
  let query = supabase
    .from("race_results")
    .select(`
      pilot_id,
      event_id,
      category_id,
      position,
      points,
      status,
      pilots!inner(
        name,
        number,
        team_name
      ),
      categories!inner(
        name
      )
    `);

  if (eventId) {
    query = query.eq("event_id", eventId);
  } else if (championshipId) {
    const { data: events } = await supabase
      .from("events")
      .select("id")
      .eq("championship_id", championshipId)
      .is("deleted_at", null);
    if (events && events.length > 0) {
      query = query.in("event_id", events.map((e) => e.id));
    }
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query.order("points", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const rows: RaceResultRow[] = data.map((r: any) => ({
    pilot_id: r.pilot_id,
    event_id: r.event_id,
    category_id: r.category_id,
    position: r.position,
    points: Number(r.points),
    status: r.status,
    pilot_name: r.pilots?.name ?? "—",
    pilot_number: r.pilots?.number ?? "",
    pilot_photo: undefined,
    team_name: r.pilots?.team_name ?? undefined,
    category_name: r.categories?.name ?? "—",
  }));

  return aggregateStandings(rows);
}

export async function getAvailableChampionships(): Promise<FilterOption[]> {
  const { data, error } = await supabase
    .from("championships")
    .select("id, name, season")
    .order("season", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((c) => ({ id: c.id, label: `${c.name} — ${c.season}` }));
}

export async function getAvailableCategories(): Promise<FilterOption[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return (data ?? []).map((c) => ({ id: c.id, label: c.name }));
}

export async function getAvailableEvents(championshipId?: string): Promise<FilterOption[]> {
  let query = supabase
    .from("events")
    .select("id, title, start_date")
    .eq("event_status", "finished")
    .is("deleted_at", null)
    .order("start_date", { ascending: false });

  if (championshipId) {
    query = query.eq("championship_id", championshipId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map((e) => ({ id: e.id, label: e.title }));
}
