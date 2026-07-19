import { supabase } from "../lib/supabase";
import {
  getAvailableChampionships,
  getAvailableCategories,
} from "./rankings";
import type { FilterOption } from "../types/rankings";

export interface RaceResultRow {
  id: string;
  pilotId: string;
  pilotName: string;
  pilotNumber: string;
  eventId: string;
  eventTitle: string;
  categoryId: string;
  categoryName: string;
  position: number;
  points: number;
  status: "finished" | "dnf" | "dns" | "dsq";
  heat: "qualifying" | "race" | "heat1" | "heat2" | "final";
  bestLap: string | null;
  totalTime: string | null;
  createdAt: string;
}

export type RaceResultInput = {
  pilotId: string;
  eventId: string;
  categoryId: string;
  position: number;
  points: number;
  status: "finished" | "dnf" | "dns" | "dsq";
  heat: "qualifying" | "race" | "heat1" | "heat2" | "final";
};

function mapRow(r: any): RaceResultRow {
  return {
    id: r.id,
    pilotId: r.pilot_id,
    pilotName: r.pilots?.name ?? "—",
    pilotNumber: r.pilots?.number ?? "",
    eventId: r.event_id,
    eventTitle: r.events?.title ?? "—",
    categoryId: r.category_id,
    categoryName: r.categories?.name ?? "—",
    position: r.position,
    points: Number(r.points ?? 0),
    status: r.status,
    heat: r.heat,
    bestLap: r.best_lap ?? null,
    totalTime: r.total_time ?? null,
    createdAt: r.created_at,
  };
}

export interface RaceResultFilters {
  championshipId?: string;
  categoryId?: string;
  eventId?: string;
}

export async function fetchRaceResults(filters: RaceResultFilters = {}): Promise<RaceResultRow[]> {
  let eventIds: string[] | null = null;
  if (!filters.eventId && filters.championshipId) {
    const { data: events } = await supabase
      .from("events")
      .select("id")
      .eq("championship_id", filters.championshipId)
      .is("deleted_at", null);
    eventIds = events?.map((e) => e.id) ?? [];
  }

  let query = supabase
    .from("race_results")
    .select(`
      id, pilot_id, event_id, category_id, position, points, status, heat, best_lap, total_time, created_at,
      pilots!inner(name, number),
      events!inner(title),
      categories!inner(name)
    `);

  if (filters.eventId) {
    query = query.eq("event_id", filters.eventId);
  } else if (eventIds) {
    if (eventIds.length === 0) return [];
    query = query.in("event_id", eventIds);
  }

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function fetchPilots(): Promise<FilterOption[]> {
  const { data, error } = await supabase
    .from("pilots")
    .select("id, name, number")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((p: any) => ({ id: p.id, label: `${p.name}${p.number ? ` #${p.number}` : ""}` }));
}

export async function fetchEventsForFilter(championshipId?: string): Promise<FilterOption[]> {
  let query = supabase
    .from("events")
    .select("id, title")
    .is("deleted_at", null)
    .order("start_date", { ascending: false });
  if (championshipId) {
    query = query.eq("championship_id", championshipId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((e: any) => ({ id: e.id, label: e.title }));
}

export async function getChampionshipOptions(): Promise<FilterOption[]> {
  return getAvailableChampionships();
}

export async function getCategoryOptions(): Promise<FilterOption[]> {
  return getAvailableCategories();
}

export async function createRaceResult(input: RaceResultInput): Promise<RaceResultRow> {
  const { data, error } = await supabase
    .from("race_results")
    .insert({
      pilot_id: input.pilotId,
      event_id: input.eventId,
      category_id: input.categoryId,
      position: input.position,
      points: input.points,
      status: input.status,
      heat: input.heat,
    })
    .select(`
      id, pilot_id, event_id, category_id, position, points, status, heat, best_lap, total_time, created_at,
      pilots!inner(name, number),
      events!inner(title),
      categories!inner(name)
    `)
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateRaceResult(id: string, input: RaceResultInput): Promise<RaceResultRow> {
  const { data, error } = await supabase
    .from("race_results")
    .update({
      pilot_id: input.pilotId,
      event_id: input.eventId,
      category_id: input.categoryId,
      position: input.position,
      points: input.points,
      status: input.status,
      heat: input.heat,
    })
    .eq("id", id)
    .select(`
      id, pilot_id, event_id, category_id, position, points, status, heat, best_lap, total_time, created_at,
      pilots!inner(name, number),
      events!inner(title),
      categories!inner(name)
    `)
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteRaceResult(id: string): Promise<void> {
  const { error } = await supabase.from("race_results").delete().eq("id", id);
  if (error) throw error;
}
