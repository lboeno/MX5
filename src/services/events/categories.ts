import { supabase } from "../../lib/supabase";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export async function fetchCategories(): Promise<CategoryOption[]> {
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data ?? []).map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
}
