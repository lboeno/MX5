export type PublicationStatus = "draft" | "published" | "archived";
export type EventStatus = "upcoming" | "registration_open" | "running" | "finished" | "cancelled";
export type ScheduleType = "practice" | "qualifying" | "race" | "ceremony" | "break" | "other";
export type SponsorTier = "platinum" | "gold" | "silver" | "bronze" | "media";

export interface Championship {
  id: string;
  name: string;
  slug: string;
  organization?: string;
  season: string;
  logo?: string;
  description?: string;
}

export interface Track {
  id: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  phone?: string;
}

export interface ScheduleItem {
  id: string;
  day: number;
  startTime: string;
  endTime?: string;
  title: string;
  description?: string;
  type: ScheduleType;
}

export interface Sponsor {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  tier?: SponsorTier;
}

export interface EventSummary {
  id: string;
  slug: string;
  title: string;
  city: string;
  state: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  entryFee: number;
  maxPilots: number;
  registeredPilots: number;
  categories: string[];
  publicationStatus: PublicationStatus;
  eventStatus: EventStatus;
  isFeatured: boolean;
  championshipName?: string;
}

export interface EventAttachment {
  id: string;
  eventId: string;
  name: string;
  filePath: string;
  mimeType: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface EventDetail {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  championship?: Championship;
  track?: Track;
  city: string;
  state: string;
  address?: string;
  organizer?: string;
  coverImage?: string;
  bannerImage?: string;
  galleryImages?: string[];
  startDate: string;
  endDate: string;
  registrationOpen?: string;
  registrationClose?: string;
  entryFee: number;
  maxPilots: number;
  registeredPilots: number;
  categories: string[];
  schedule: ScheduleItem[];
  sponsors: Sponsor[];
  attachments: EventAttachment[];
  publicationStatus: PublicationStatus;
  eventStatus: EventStatus;
  isFeatured: boolean;
  createdAt: string;
}

export interface EventFormData {
  title: string;
  subtitle?: string;
  description?: string;
  championshipId?: string;
  trackId?: string;
  city: string;
  state: string;
  address?: string;
  organizer?: string;
  coverFile?: File | null;
  bannerFile?: File | null;
  galleryFiles?: File[];
  startDate: string;
  endDate: string;
  registrationOpen?: string;
  registrationClose?: string;
  entryFee: number;
  maxPilots: number;
  eventStatus: EventStatus;
  isFeatured: boolean;
  categories: string[];
  schedule: Omit<ScheduleItem, "id">[];
  sponsors: Omit<Sponsor, "id">[];
  attachments?: { name: string; file: File; filePath?: string; mimeType?: string; fileSize?: number }[];
}
