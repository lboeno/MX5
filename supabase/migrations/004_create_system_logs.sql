-- Migration: Create system_logs table
-- 2026-07-18

CREATE TABLE system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_system_logs_created ON system_logs(created_at DESC);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_entity ON system_logs(entity, entity_id);

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_system_logs" ON system_logs
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "authenticated_select_logs" ON system_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');
