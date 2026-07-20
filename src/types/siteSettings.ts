export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  id: string;
  // Geral
  platformName: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  defaultTheme: "light" | "dark";
  language: string;
  timezone: string;
  // Contato
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactAddress: string | null;
  siteUrl: string | null;
  socialLinks: SocialLink[];
  // Eventos
  eventsOpen: boolean;
  maxSignups: number;
  allowWaitlist: boolean;
  requireCompleteProfile: boolean;
  allowCancellation: boolean;
  // Pagamentos
  paymentsEnabled: boolean;
  pixKey: string | null;
  paymentGateway: string | null;
  defaultFee: number;
  paymentDeadlineHours: number;
  // Notificações
  emailConfirmation: boolean;
  emailApproval: boolean;
  emailPayment: boolean;
  emailTemplates: Record<string, string>;
  // Segurança
  allowSignup: boolean;
  requireEmailConfirm: boolean;
  adminMfa: boolean;
  sessionTimeoutMinutes: number;
  // Integrações
  googleLogin: boolean;
  turnstile: boolean;
  gaId: string | null;
  metaPixel: string | null;
  // Manutenção
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  infoBanner: string | null;
  // Sobre
  systemVersion: string | null;
  lastUpdated: string;
  updatedAt: string;
}

export interface SiteSettingsInput {
  platformName?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  defaultTheme?: "light" | "dark";
  language?: string;
  timezone?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  contactAddress?: string | null;
  siteUrl?: string | null;
  socialLinks?: SocialLink[];
  eventsOpen?: boolean;
  maxSignups?: number;
  allowWaitlist?: boolean;
  requireCompleteProfile?: boolean;
  allowCancellation?: boolean;
  paymentsEnabled?: boolean;
  pixKey?: string | null;
  paymentGateway?: string | null;
  defaultFee?: number;
  paymentDeadlineHours?: number;
  emailConfirmation?: boolean;
  emailApproval?: boolean;
  emailPayment?: boolean;
  emailTemplates?: Record<string, string>;
  allowSignup?: boolean;
  requireEmailConfirm?: boolean;
  adminMfa?: boolean;
  sessionTimeoutMinutes?: number;
  googleLogin?: boolean;
  turnstile?: boolean;
  gaId?: string | null;
  metaPixel?: string | null;
  maintenanceMode?: boolean;
  maintenanceMessage?: string | null;
  infoBanner?: string | null;
  systemVersion?: string | null;
}
