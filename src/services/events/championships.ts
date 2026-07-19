import { supabase } from "../../lib/supabase";
import type { Championship } from "../../types/events";

export async function fetchChampionships(): Promise<Championship[]> {
  const { data } = await supabase.from("championships").select("*").order("name");
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    organization: c.organization ?? undefined,
    season: c.season,
    logo: c.logo ?? undefined,
    description: c.description ?? undefined,
  }));
}
