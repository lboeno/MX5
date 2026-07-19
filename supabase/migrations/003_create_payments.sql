-- Migration: Create payments table
-- 2026-07-18

CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID REFERENCES pilot_registrations(id) ON DELETE SET NULL,
  pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  event_id UUID,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refund', 'cancelled')),
  method TEXT CHECK (method IN ('pix', 'mercado_pago', 'asaas', 'stripe', 'cash')),
  provider TEXT,
  provider_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_pilot ON payments(pilot_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at DESC);
CREATE INDEX idx_payments_paid ON payments(paid_at) WHERE status = 'paid';

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_payments" ON payments
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "pilots_select_own_payments" ON payments
  FOR SELECT
  USING (
    pilot_id IN (SELECT id FROM pilots WHERE profile_id = auth.uid())
  );
