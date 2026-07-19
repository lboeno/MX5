import type { RankingStanding, RaceResultRow } from "../../types/rankings";

export function aggregateStandings(rows: RaceResultRow[]): RankingStanding[] {
  const map = new Map<string, {
    pilotName: string;
    pilotNumber: string;
    categoryName: string;
    categoryId: string;
    team?: string;
    photo?: string;
    points: number;
    wins: number;
    podiums: number;
    events: Set<string>;
    lastPosition: number;
    lastStatus: string;
  }>();

  for (const row of rows) {
    let entry = map.get(row.pilot_id);
    if (!entry) {
      entry = {
        pilotName: row.pilot_name,
        pilotNumber: row.pilot_number,
        categoryName: row.category_name,
        categoryId: row.category_id,
        team: row.team_name,
        photo: row.pilot_photo,
        points: 0,
        wins: 0,
        podiums: 0,
        events: new Set(),
        lastPosition: 0,
        lastStatus: "finished",
      };
      map.set(row.pilot_id, entry);
    }

    entry.points += Number(row.points);
    entry.events.add(row.event_id);
    if (row.position === 1) entry.wins++;
    if (row.position <= 3) entry.podiums++;
    entry.lastPosition = row.position;
    entry.lastStatus = row.status;
  }

  const standings: RankingStanding[] = Array.from(map.entries()).map(([pilotId, e]) => ({
    position: 0,
    pilotId,
    pilotName: e.pilotName,
    pilotNumber: e.pilotNumber,
    category: e.categoryName,
    categoryId: e.categoryId,
    team: e.team,
    photo: e.photo,
    points: e.points,
    wins: e.wins,
    podiums: e.podiums,
    events: e.events.size,
    lastResult: formatLastResult(e.lastPosition, e.lastStatus),
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.pilotName.localeCompare(b.pilotName);
  });

  standings.forEach((s, i) => { s.position = i + 1; });

  return standings;
}

export function formatLastResult(position: number, status: string): string | null {
  if (status === "dnf") return "DNF";
  if (status === "dns") return "DNS";
  if (status === "dsq") return "DSQ";
  if (position <= 0) return null;
  return `${position}º`;
}
