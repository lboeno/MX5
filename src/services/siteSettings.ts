import { supabase } from "../lib/supabase";
import type { SiteSettings, SiteSettingsInput, SocialLink } from "../types/siteSettings";

function parseJson<T>(value: any, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function mapRow(row: any): SiteSettings {
  return {
    id: row.id,
    platformName: row.platform_name ?? null,
    logoUrl: row.logo_url ?? null,
    faviconUrl: row.favicon_url ?? null,
    defaultTheme: row.default_theme === "light" ? "light" : "dark",
    language: row.language ?? "pt-BR",
    timezone: row.timezone ?? "America/Sao_Paulo",
    contactEmail: row.contact_email ?? null,
    contactPhone: row.contact_phone ?? null,
    contactWhatsapp: row.contact_whatsapp ?? null,
    contactAddress: row.contact_address ?? null,
    siteUrl: row.site_url ?? null,
    socialLinks: parseJson<SocialLink[]>(row.social_links, []),
    eventsOpen: row.events_open ?? true,
    maxSignups: row.max_signups ?? 100,
    allowWaitlist: row.allow_waitlist ?? true,
    requireCompleteProfile: row.require_complete_profile ?? false,
    allowCancellation: row.allow_cancellation ?? true,
    paymentsEnabled: row.payments_enabled ?? false,
    pixKey: row.pix_key ?? null,
    paymentGateway: row.payment_gateway ?? null,
    defaultFee: Number(row.default_fee ?? 0),
    paymentDeadlineHours: row.payment_deadline_hours ?? 48,
    emailConfirmation: row.email_confirmation ?? true,
    emailApproval: row.email_approval ?? true,
    emailPayment: row.email_payment ?? true,
    emailTemplates: parseJson<Record<string, string>>(row.email_templates, {}),
    allowSignup: row.allow_signup ?? true,
    requireEmailConfirm: row.require_email_confirm ?? true,
    adminMfa: row.admin_mfa ?? false,
    sessionTimeoutMinutes: row.session_timeout_minutes ?? 60,
    googleLogin: row.google_login ?? false,
    turnstile: row.turnstile ?? false,
    gaId: row.ga_id ?? null,
    metaPixel: row.meta_pixel ?? null,
    maintenanceMode: row.maintenance_mode ?? false,
    maintenanceMessage: row.maintenance_message ?? null,
    infoBanner: row.info_banner ?? null,
    systemVersion: row.system_version ?? null,
    lastUpdated: row.last_updated,
    updatedAt: row.updated_at,
  };
}

const SETTINGS_ID = "default";

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    // fallback caso a linha ainda não exista
    return mapRow({ id: SETTINGS_ID });
  }
  return mapRow(data);
}

export async function updateSiteSettings(input: SiteSettingsInput): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .update({
      platform_name: input.platformName,
      logo_url: input.logoUrl,
      favicon_url: input.faviconUrl,
      default_theme: input.defaultTheme,
      language: input.language,
      timezone: input.timezone,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      contact_whatsapp: input.contactWhatsapp,
      contact_address: input.contactAddress,
      site_url: input.siteUrl,
      social_links: input.socialLinks ?? [],
      events_open: input.eventsOpen,
      max_signups: input.maxSignups,
      allow_waitlist: input.allowWaitlist,
      require_complete_profile: input.requireCompleteProfile,
      allow_cancellation: input.allowCancellation,
      payments_enabled: input.paymentsEnabled,
      pix_key: input.pixKey,
      payment_gateway: input.paymentGateway,
      default_fee: input.defaultFee,
      payment_deadline_hours: input.paymentDeadlineHours,
      email_confirmation: input.emailConfirmation,
      email_approval: input.emailApproval,
      email_payment: input.emailPayment,
      email_templates: input.emailTemplates ?? {},
      allow_signup: input.allowSignup,
      require_email_confirm: input.requireEmailConfirm,
      admin_mfa: input.adminMfa,
      session_timeout_minutes: input.sessionTimeoutMinutes,
      google_login: input.googleLogin,
      turnstile: input.turnstile,
      ga_id: input.gaId,
      meta_pixel: input.metaPixel,
      maintenance_mode: input.maintenanceMode,
      maintenance_message: input.maintenanceMessage,
      info_banner: input.infoBanner,
      system_version: input.systemVersion,
      last_updated: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", SETTINGS_ID)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function uploadSiteAsset(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("site-assets").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
  return data.publicUrl;
}
