export interface RankingStanding {
  position: number;
  pilotId: string;
  pilotName: string;
  pilotNumber: string;
  category: string;
  categoryId: string;
  team?: string;
  photo?: string;
  points: number;
  wins: number;
  podiums: number;
  events: number;
  lastResult: string | null;
}

export interface RankingsOverview {
  leader: { name: string; points: number; photo?: string } | null;
  totalPilots: number;
  totalCategories: number;
  lastUpdated: string;
}

export interface FilterOption {
  id: string;
  label: string;
}

export interface RaceResultRow {
  pilot_id: string;
  event_id: string;
  category_id: string;
  position: number;
  points: number;
  status: string;
  pilot_name: string;
  pilot_number: string;
  pilot_photo?: string;
  team_name?: string;
  category_name: string;
}
