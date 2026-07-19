import { supabase } from "../../lib/supabase";
import type { Track } from "../../types/events";

export async function fetchTracks(): Promise<Track[]> {
  const { data } = await supabase.from("tracks").select("*").order("name");
  return (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    city: t.city,
    state: t.state,
    address: t.address ?? undefined,
    latitude: t.latitude ? Number(t.latitude) : undefined,
    longitude: t.longitude ? Number(t.longitude) : undefined,
    website: t.website ?? undefined,
    phone: t.phone ?? undefined,
  }));
}
