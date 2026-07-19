-- Migration: Site settings (platform configuration)
-- Tabela site_settings (uma única linha id='default') + bucket site-assets

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  -- Geral
  platform_name TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  default_theme TEXT DEFAULT 'dark' CHECK (default_theme IN ('light', 'dark')),
  language TEXT DEFAULT 'pt-BR',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  -- Contato
  contact_email TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_address TEXT,
  site_url TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  -- Eventos
  events_open BOOLEAN DEFAULT true,
  max_signups INTEGER DEFAULT 100,
  allow_waitlist BOOLEAN DEFAULT true,
  require_complete_profile BOOLEAN DEFAULT false,
  allow_cancellation BOOLEAN DEFAULT true,
  -- Pagamentos
  payments_enabled BOOLEAN DEFAULT false,
  pix_key TEXT,
  payment_gateway TEXT,
  default_fee NUMERIC DEFAULT 0,
  payment_deadline_hours INTEGER DEFAULT 48,
  -- Notificações
  email_confirmation BOOLEAN DEFAULT true,
  email_approval BOOLEAN DEFAULT true,
  email_payment BOOLEAN DEFAULT true,
  email_templates JSONB DEFAULT '{}'::jsonb,
  -- Segurança
  allow_signup BOOLEAN DEFAULT true,
  require_email_confirm BOOLEAN DEFAULT true,
  admin_mfa BOOLEAN DEFAULT false,
  session_timeout_minutes INTEGER DEFAULT 60,
  -- Integrações
  google_login BOOLEAN DEFAULT false,
  turnstile BOOLEAN DEFAULT false,
  ga_id TEXT,
  meta_pixel TEXT,
  -- Manutenção
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,
  info_banner TEXT,
  -- Sobre
  system_version TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 'default')
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select" ON site_settings;
CREATE POLICY "site_settings_select" ON site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_settings_admin" ON site_settings;
CREATE POLICY "site_settings_admin" ON site_settings
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Seed da linha padrão
INSERT INTO site_settings (id, system_version, last_updated)
VALUES ('default', '1.0.0', now())
ON CONFLICT (id) DO NOTHING;

-- Storage bucket para logo/favicon
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "admin_insert_site_assets" ON storage.objects;
CREATE POLICY "admin_insert_site_assets" ON storage.objects
  FOR INSERT
  WITH CHECK (is_admin() AND bucket_id = 'site-assets');

DROP POLICY IF EXISTS "admin_update_site_assets" ON storage.objects;
CREATE POLICY "admin_update_site_assets" ON storage.objects
  FOR UPDATE
  USING (is_admin() AND bucket_id = 'site-assets')
  WITH CHECK (is_admin() AND bucket_id = 'site-assets');

DROP POLICY IF EXISTS "admin_delete_site_assets" ON storage.objects;
CREATE POLICY "admin_delete_site_assets" ON storage.objects
  FOR DELETE
  USING (is_admin() AND bucket_id = 'site-assets');

DROP POLICY IF EXISTS "select_site_assets" ON storage.objects;
CREATE POLICY "select_site_assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'site-assets');
