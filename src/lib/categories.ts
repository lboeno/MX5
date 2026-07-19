import { supabase } from "./supabase";
import type { Category } from "../types";

const CATEGORY_DB_NAMES: Record<string, string> = {
  MX_VET: "MX VET",
  MX_JR: "MX JR",
  MX_MINI: "MX MINI",
};

function normalizeCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

export function toDbCategoryName(category?: string | null): string | null {
  if (!category) return null;
  return CATEGORY_DB_NAMES[category] ?? category;
}

export function toAppCategoryName(category?: string | null): Category {
  if (!category) return "MX1";
  return category.trim().replace(/\s+/g, "_") as Category;
}

export async function getCategoryId(category?: string | null): Promise<string | null> {
  const dbName = toDbCategoryName(category);
  if (!dbName) return null;

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug");

  if (error) throw error;

  const expected = normalizeCategory(dbName);
  return (
    data?.find(
      (row) =>
        normalizeCategory(row.name) === expected ||
        normalizeCategory(row.slug) === expected
    )?.id ?? null
  );
}
