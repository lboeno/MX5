import { supabase } from "./supabase";
import { getCategoryId, toAppCategoryName } from "./categories";
import type { Pilot } from "../types";

function mapPilot(row: any): Pilot {
  const categoryName = row.categories?.name ?? row.category_name ?? row.competition_category;

  return {
    id: row.id,
    profileId: row.profile_id ?? "",
    number: row.number ?? row.bike_number ?? "",
    name: row.name ?? row.full_name ?? "Sem nome",
    nickname: row.nickname ?? undefined,
    photo: row.photo_url ?? undefined,
    category: toAppCategoryName(categoryName),
    team: row.team_name ?? undefined,
    nationality: row.nationality ?? "Brasil",
    birthDate: row.birth_date ?? "",
    licenseNumber: "",
    licenseExpiry: "",
    motorcycle: {
      brand: row.motorcycle_brand ?? "",
      model: row.motorcycle_model ?? "",
      year: row.motorcycle_year ?? new Date().getFullYear(),
      engineCC: Number(row.motorcycle_engine_cc ?? 0),
      color: row.motorcycle_color ?? "",
      chassis: row.motorcycle_chassis ?? "",
    },
    points: row.points ?? 0,
    ranking: row.ranking ?? 0,
    wins: row.wins ?? 0,
    podiums: row.podiums ?? 0,
    dnf: row.dnf ?? 0,
    status: row.status ?? "active",
    sponsors: row.sponsors ? row.sponsors.split(",").map((s: string) => s.trim()) : undefined,
    emergencyContact: {
      name: row.emergency_name ?? "",
      phone: row.emergency_phone ?? "",
      relation: row.emergency_relation ?? "",
    },
    history: [],
  };
}

export async function fetchPilots(filters?: {
  search?: string;
  category?: string;
}) {
  let query = supabase.from("pilots").select("*, categories(name, slug)");

  if (filters?.category && filters.category !== "all") {
    const categoryId = await getCategoryId(filters.category);
    if (!categoryId) return [];
    query = query.eq("category_id", categoryId);
  }

  if (filters?.search) {
    const term = `%${filters.search}%`;
    query = query.or(
      `name.ilike.${term},number.ilike.${term},team_name.ilike.${term}`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPilot);
}

export async function fetchPilot(id: string) {
  const { data, error } = await supabase
    .from("pilots")
    .select("*, categories(name, slug)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapPilot(data);
}

export async function fetchMyPilot() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("pilots")
    .select("*, categories(name, slug)")
    .eq("profile_id", user.user.id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPilot(data) : null;
}

export async function createPilot(data: Partial<Pilot> & { profile_id: string }) {
  const categoryId = await getCategoryId(data.category);

  const { error } = await supabase.from("pilots").insert({
    profile_id: data.profile_id,
    name: data.name,
    nickname: data.nickname ?? null,
    photo_url: data.photo ?? null,
    nationality: data.nationality ?? "Brasil",
    category_id: categoryId,
    number: data.number ?? null,
    team_name: data.team ?? null,
    motorcycle_brand: data.motorcycle?.brand ?? null,
    motorcycle_model: data.motorcycle?.model ?? null,
    motorcycle_year: data.motorcycle?.year ?? null,
    motorcycle_engine_cc: String(data.motorcycle?.engineCC ?? ""),
    motorcycle_color: data.motorcycle?.color ?? null,
    motorcycle_chassis: data.motorcycle?.chassis ?? null,
    status: data.status ?? "active",
    sponsors: data.sponsors?.join(", ") ?? null,
  });
  if (error) throw error;
}

export async function updatePilot(id: string, data: Partial<Pilot>) {
  const updates: Record<string, any> = {};

  if (data.name !== undefined) updates.name = data.name;
  if (data.nickname !== undefined) updates.nickname = data.nickname;
  if (data.photo !== undefined) updates.photo_url = data.photo;
  if (data.nationality !== undefined) updates.nationality = data.nationality;
  if (data.category !== undefined) updates.category_id = await getCategoryId(data.category);
  if (data.number !== undefined) updates.number = data.number;
  if (data.team !== undefined) updates.team_name = data.team;
  if (data.status !== undefined) updates.status = data.status;
  if (data.sponsors !== undefined) updates.sponsors = data.sponsors.join(", ");
  if (data.motorcycle) {
    if (data.motorcycle.brand !== undefined) updates.motorcycle_brand = data.motorcycle.brand;
    if (data.motorcycle.model !== undefined) updates.motorcycle_model = data.motorcycle.model;
    if (data.motorcycle.year !== undefined) updates.motorcycle_year = data.motorcycle.year;
    if (data.motorcycle.engineCC !== undefined) updates.motorcycle_engine_cc = String(data.motorcycle.engineCC);
    if (data.motorcycle.color !== undefined) updates.motorcycle_color = data.motorcycle.color;
    if (data.motorcycle.chassis !== undefined) updates.motorcycle_chassis = data.motorcycle.chassis;
  }

  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("pilots")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deletePilot(id: string) {
  const { error } = await supabase.from("pilots").delete().eq("id", id);
  if (error) throw error;
}
