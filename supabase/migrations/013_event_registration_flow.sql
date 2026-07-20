-- Sprint 1 — Event registration flow
-- Extends pilot_registrations with the minimal flow columns.
-- Domain is FROZEN after this migration (status, current_step, payment_status).
--
-- NOTE: the columns profile_id, registration_number and the full set of pilot
-- signup fields (full_name, cpf, ...) already exist in the DB from the pilot
-- signup flow (Registrar.tsx). This migration only adds the flow columns that
-- were missing and widens the status CHECK.
--
-- IMPORTANT: keep these enum values in sync across 3 places:
--   1. This migration (CHECK constraints)
--   2. src/types/events.ts (RegistrationStatus, CurrentStep, PaymentStatus)
--   3. src/domain/registration/stateMachine.ts (STEP_ORDER + lists)
-- Any rename (e.g. checkin -> checked_in) must be updated in all three.

ALTER TABLE pilot_registrations
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled', 'na')),
  ADD COLUMN IF NOT EXISTS current_step TEXT NOT NULL DEFAULT 'registration'
    CHECK (current_step IN ('registration', 'review', 'payment', 'approved', 'checkin', 'racing', 'finished'));

-- Expand status CHECK to include 'rejected' (keep existing values).
ALTER TABLE pilot_registrations
  DROP CONSTRAINT IF EXISTS pilot_registrations_status_check;

ALTER TABLE pilot_registrations
  ADD CONSTRAINT pilot_registrations_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'waitlist'));
