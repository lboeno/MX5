export type PublicationStatus = "draft" | "published" | "archived";
export type EventStatus = "upcoming" | "registration_open" | "running" | "finished" | "cancelled";

// Event statuses that allow pilot enrollment.
export const ENROLLABLE_STATUSES: EventStatus[] = ["upcoming", "registration_open"];
export function isEnrollmentOpen(status: EventStatus): boolean {
  return ENROLLABLE_STATUSES.includes(status);
}
export type ScheduleType = "practice" | "qualifying" | "race" | "ceremony" | "break" | "other";
export type SponsorTier = "platinum" | "gold" | "silver" | "bronze" | "media";

// --- Registration domain (Sprint 1) ---
// Keep these enums in sync with:
//   - supabase/migrations/013_event_registration_flow.sql (CHECK constraints)
//   - src/domain/registration/stateMachine.ts (STEP_ORDER)
export type RegistrationStatus = "pending" | "approved" | "rejected" | "cancelled" | "waitlist";
export type PaymentStatus = "pending" | "paid" | "refunded" | "cancelled" | "na";
export type CurrentStep =
  | "registration"
  | "review"
  | "payment"
  | "approved"
  | "checkin"
  | "racing"
  | "finished";

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

export interface EventRegistration {
  id: string;
  eventId: string;
  pilotId: string;
  registrationNumber?: string;
  status: RegistrationStatus;
  currentStep: CurrentStep;
  paymentStatus: PaymentStatus;
  createdAt: string;
  confirmedAt?: string;
  // Denormalized from pilots table at read time (admin list view)
  pilotName: string;
  pilotNumber: string;
  category: string;
  team?: string;
  // Denormalized from events table at read time (pilot detail view)
  eventTitle?: string;
  eventSlug?: string;
  eventStart?: string;
  entryFee?: number;
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
