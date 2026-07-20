import { fetchAllEvents } from "../services/events/fetch";
import { fetchNews } from "../services/news";
import { fetchGallery } from "../services/gallery";
import { fetchPilots } from "../lib/pilots";
import { getAllPayments } from "../services/dashboard/payments";

export type SearchResultType = "evento" | "noticia" | "galeria" | "piloto" | "pagamento";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  label: string;
  sublabel?: string;
  link: string;
}

const TYPE_LABEL: Record<SearchResultType, string> = {
  evento: "Eventos",
  noticia: "Notícias",
  galeria: "Galeria",
  piloto: "Pilotos",
  pagamento: "Pagamentos",
};

const TYPE_ICON: Record<SearchResultType, string> = {
  evento: "Calendar",
  noticia: "Newspaper",
  galeria: "Image",
  piloto: "Users",
  pagamento: "CreditCard",
};

export { TYPE_LABEL, TYPE_ICON };

export async function searchAll(term: string, limit = 5): Promise<SearchResult[]> {
  const t = term.trim().toLowerCase();
  if (!t) return [];

  const [events, news, gallery, pilots, payments] = await Promise.allSettled([
    fetchAllEvents({ search: term }),
    fetchNews({ search: term }),
    fetchGallery({ search: term }),
    fetchPilots({ search: term }),
    getAllPayments(),
  ]);

  const results: SearchResult[] = [];

  if (events.status === "fulfilled") {
    for (const e of events.value.slice(0, limit)) {
      results.push({ type: "evento", id: e.id, label: e.title, sublabel: [e.city, e.state].filter(Boolean).join(" · ") || undefined, link: "/admin/eventos" });
    }
  }

  if (news.status === "fulfilled") {
    for (const n of news.value.slice(0, limit)) {
      results.push({ type: "noticia", id: n.id, label: n.title, sublabel: n.category, link: "/admin/noticias" });
    }
  }

  if (gallery.status === "fulfilled") {
    for (const g of gallery.value.slice(0, limit)) {
      results.push({
        type: "galeria",
        id: g.id,
        label: g.alt || "Foto",
        sublabel: g.eventName,
        link: "/admin/galeria",
      });
    }
  }

  if (pilots.status === "fulfilled") {
    for (const p of pilots.value.slice(0, limit)) {
      results.push({
        type: "piloto",
        id: p.id,
        label: p.name,
        sublabel: p.number ? `Nº ${p.number}${p.team ? " · " + p.team : ""}` : p.team,
        link: "/admin/pilotos",
      });
    }
  }

  if (payments.status === "fulfilled") {
    const tp = payments.value
      .filter(
        (p) =>
          p.pilotName.toLowerCase().includes(t) ||
          p.eventName.toLowerCase().includes(t) ||
          (p.transactionId ?? "").toLowerCase().includes(t)
      )
      .slice(0, limit);
    for (const p of tp) {
      results.push({
        type: "pagamento",
        id: p.id,
        label: p.pilotName,
        sublabel: `${p.eventName} · ${p.status}`,
        link: "/admin/pagamentos",
      });
    }
  }

  return results;
}
