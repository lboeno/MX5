export type UserRole =
  | "admin"
  | "organizer"
  | "pilot"
  | "team"
  | "timekeeper"
  | "photographer"
  | "press"
  | "guest";

export type EventStatus =
  | "upcoming"
  | "open"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "archived";

export type PaymentStatus = "pending" | "paid" | "refund" | "cancelled";
export type PaymentMethod = "pix" | "mercado_pago" | "asaas" | "stripe" | "cash";

export type Category =
  | "MX1"
  | "MX2"
  | "MX3"
  | "MXF"
  | "MX_VET"
  | "MX_JR"
  | "MX_MINI"
  | "ENDURO"
  | "TRAIL";

export interface CategoryInfo {
  id: Category;
  nome: string;
  tipoMoto: string;
  motor: string;
  idadeMinima: number;
  idadeMaxima: number | null;
  exigeCNH: boolean;
  exigeCBM: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  status: "active" | "inactive" | "banned";
}

export interface Pilot {
  id: string;
  profileId: string;
  number: string;
  name: string;
  nickname?: string;
  photo?: string;
  category: Category;
  team?: string;
  nationality: string;
  birthDate: string;
  licenseNumber: string;
  licenseExpiry: string;
  motorcycle: Motorcycle;
  points: number;
  ranking: number;
  wins: number;
  podiums: number;
  dnf: number;
  status: "active" | "inactive" | "suspended";
  sponsors?: string[];
  emergencyContact: EmergencyContact;
  history: RaceResult[];
}

export interface Motorcycle {
  brand: string;
  model: string;
  year: number;
  engineCC: number;
  color: string;
  chassis: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Document {
  id: string;
  type: "cnh" | "medical" | "license" | "id" | "other";
  name: string;
  url: string;
  expiresAt?: string;
  verified: boolean;
}

export interface RaceResult {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  category: Category;
  position: number;
  points: number;
  lapTime?: string;
  bestLap?: string;
  dnf: boolean;
  dns: boolean;
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  edition: number;
  status: EventStatus;
  date: string;
  endDate: string;
  location: EventLocation;
  categories: Category[];
  description: string;
  coverImage?: string;
  organizer: string;
  organizerId: string;
  maxPilots: number;
  registeredPilots: number;
  registrationFee: number;
  registrationDeadline: string;
  schedule: ScheduleItem[];
  sponsors: Sponsor[];
  results?: EventResult[];
  qrCode?: string;
}

export interface EventLocation {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  mapUrl?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  category?: Category;
  type: "practice" | "qualifying" | "race" | "ceremony" | "break";
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "media";
  url?: string;
}

export interface EventResult {
  pilotId: string;
  pilotName: string;
  pilotNumber: string;
  category: Category;
  position: number;
  points: number;
  totalTime?: string;
  gap?: string;
  fastestLap?: string;
  dnf: boolean;
  dns: boolean;
}

export interface Championship {
  id: string;
  name: string;
  year: number;
  category: Category;
  standings: Standing[];
  events: string[];
  status: "active" | "finished" | "upcoming";
}

export interface Standing {
  position: number;
  pilotId: string;
  pilotName: string;
  pilotNumber: string;
  team?: string;
  photo?: string;
  points: number;
  wins: number;
  podiums: number;
  events: number;
  nationality: string;
}

export interface Payment {
  id: string;
  pilotId: string;
  pilotName: string;
  eventId: string;
  eventName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  transactionId?: string;
  category: Category;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorPhoto?: string;
  publishedAt: string;
  tags: string[];
  category: "race_report" | "news" | "interview" | "preview" | "analysis";
  views: number;
  featured: boolean;
}

export interface GalleryPhoto {
  id: string;
  eventId?: string;
  eventName?: string;
  url: string;
  thumbnail: string;
  alt: string;
  photographer: string;
  takenAt: string;
  tags: string[];
  featured: boolean;
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: string;
}

export interface Log {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ip: string;
  createdAt: string;
  level: "info" | "warning" | "error" | "critical";
}

export interface Registration {
  id: string;
  pilotId: string;
  pilotName: string;
  pilotNumber: string;
  eventId: string;
  eventName: string;
  category: Category;
  paymentStatus: PaymentStatus;
  registeredAt: string;
  confirmedAt?: string;
  status: "pending" | "confirmed" | "cancelled" | "waitlist";
}

export interface PilotRegistration {
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  gender: string;
  maritalStatus?: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  complement?: string;
  phone: string;
  email: string;
  secondaryPhone?: string;
  password: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  bloodType?: string;
  competitionCategory: Category;
  bikeNumber?: string;
  teamName?: string;
  teamCity?: string;
  teamState?: string;
  documents: {
    photo?: File | null;
    rg?: File | null;
    cpf?: File | null;
    terms?: File | null;
    cnh?: File | null;
  };
  medicalBloodType?: string;
  hasAllergies: boolean;
  allergiesDescription?: string;
  hasMedication: boolean;
  medicationDescription?: string;
  hasCondition: boolean;
  conditionDescription?: string;
  sponsors?: string[];
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  acceptsRegulations: boolean;
  acceptsPrivacy: boolean;
  acceptsTruthfulness: boolean;
}

export interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}
