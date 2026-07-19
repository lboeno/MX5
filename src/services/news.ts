import { supabase } from "../lib/supabase";
import type { NewsArticle } from "../types";

function mapRow(row: any): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    coverImage: row.cover_image ?? "",
    author: row.author ?? "",
    authorPhoto: row.author_photo ?? undefined,
    publishedAt: row.published_at,
    tags: Array.isArray(row.tags) ? row.tags : [],
    category: row.category,
    views: row.views ?? 0,
    featured: row.featured ?? false,
    status: row.status ?? "draft",
  };
}

export interface NewsFilters {
  status?: "draft" | "published" | "all";
  search?: string;
  featured?: boolean;
  category?: string;
}

export async function fetchNews(filters: NewsFilters = {}): Promise<NewsArticle[]> {
  let query = supabase.from("news").select("*");

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.featured !== undefined) {
    query = query.eq("featured", filters.featured);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  query = query.order("published_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []).map(mapRow);
  if (filters.search) {
    const s = filters.search.toLowerCase();
    rows = rows.filter(
      (r) => r.title.toLowerCase().includes(s) || r.excerpt.toLowerCase().includes(s)
    );
  }
  return rows;
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export type NewsInput = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorPhoto?: string;
  tags: string[];
  category: NewsArticle["category"];
  featured: boolean;
  status: "draft" | "published";
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createNews(input: NewsInput): Promise<NewsArticle> {
  const slug = input.slug?.trim() || slugify(input.title);
  const { data, error } = await supabase
    .from("news")
    .insert({
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      cover_image: input.coverImage || null,
      author: input.author,
      author_photo: input.authorPhoto ?? null,
      tags: input.tags,
      category: input.category,
      featured: input.featured,
      status: input.status,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateNews(id: string, input: NewsInput): Promise<NewsArticle> {
  const slug = input.slug?.trim() || slugify(input.title);
  const { data, error } = await supabase
    .from("news")
    .update({
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      cover_image: input.coverImage || null,
      author: input.author,
      author_photo: input.authorPhoto ?? null,
      tags: input.tags,
      category: input.category,
      featured: input.featured,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteNews(id: string): Promise<void> {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
}

export async function publishNews(id: string, published: boolean): Promise<void> {
  const { error } = await supabase
    .from("news")
    .update({ status: published ? "published" : "draft", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
