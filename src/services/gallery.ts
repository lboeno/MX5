import { supabase } from "../lib/supabase";
import type { GalleryPhoto } from "../types";

function mapRow(row: any): GalleryPhoto {
  return {
    id: row.id,
    eventId: row.event_id ?? undefined,
    eventName: row.event_name ?? undefined,
    url: row.url,
    thumbnail: row.thumbnail,
    alt: row.alt,
    photographer: row.photographer ?? "",
    takenAt: row.taken_at,
    tags: Array.isArray(row.tags) ? row.tags : [],
    featured: row.featured ?? false,
  };
}

export interface GalleryFilters {
  search?: string;
  eventName?: string;
}

export async function fetchGallery(filters: GalleryFilters = {}): Promise<GalleryPhoto[]> {
  let query = supabase.from("gallery_photos").select("*");

  if (filters.eventName) {
    query = query.eq("event_name", filters.eventName);
  }

  query = query.order("taken_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []).map(mapRow);
  if (filters.search) {
    const s = filters.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.alt.toLowerCase().includes(s) ||
        (r.photographer ?? "").toLowerCase().includes(s) ||
        (r.eventName ?? "").toLowerCase().includes(s)
    );
  }
  return rows;
}

export type GalleryInput = {
  eventId?: string;
  eventName?: string;
  url: string;
  thumbnail: string;
  alt: string;
  photographer: string;
  takenAt: string;
  tags: string[];
  featured: boolean;
};

export async function createGallery(input: GalleryInput): Promise<GalleryPhoto> {
  const { data, error } = await supabase
    .from("gallery_photos")
    .insert({
      event_id: input.eventId ?? null,
      event_name: input.eventName ?? null,
      url: input.url,
      thumbnail: input.thumbnail,
      alt: input.alt,
      photographer: input.photographer || null,
      taken_at: input.takenAt,
      tags: input.tags,
      featured: input.featured,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateGallery(id: string, input: GalleryInput): Promise<GalleryPhoto> {
  const { data, error } = await supabase
    .from("gallery_photos")
    .update({
      event_id: input.eventId ?? null,
      event_name: input.eventName ?? null,
      url: input.url,
      thumbnail: input.thumbnail,
      alt: input.alt,
      photographer: input.photographer || null,
      taken_at: input.takenAt,
      tags: input.tags,
      featured: input.featured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteGallery(id: string): Promise<void> {
  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadGalleryImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("gallery").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("gallery").getPublicUrl(path);
  return data.publicUrl;
}
