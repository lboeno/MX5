-- Migration: Create private storage bucket + registration_documents table
-- 2026-07-18

-- 1. Create private bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pilot-documents',
  'pilot-documents',
  false,
  15728640, -- 15MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS
-- Path pattern: {profile_id}/{registration_id}/{document_type}.{ext}
DROP POLICY IF EXISTS "pilots_insert_own_documents" ON storage.objects;
CREATE POLICY "pilots_insert_own_documents" ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "pilots_select_own_or_admin" ON storage.objects;
CREATE POLICY "pilots_select_own_or_admin" ON storage.objects
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR is_admin()
    )
  );

DROP POLICY IF EXISTS "admin_delete_documents" ON storage.objects;
CREATE POLICY "admin_delete_documents" ON storage.objects
  FOR DELETE
  USING (is_admin());

-- 3. Create registration_documents table
CREATE TABLE registration_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES pilot_registrations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('photo', 'identity', 'terms', 'cnh')),
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resubmit')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  UNIQUE (registration_id, document_type)
);

CREATE INDEX idx_reg_docs_registration ON registration_documents(registration_id);

-- 4. RLS for registration_documents
ALTER TABLE registration_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_own_registration_docs" ON registration_documents
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT pilots.profile_id FROM pilot_registrations
      JOIN pilots ON pilots.id = pilot_registrations.pilot_id
      WHERE pilot_registrations.id = registration_id
    )
  );

CREATE POLICY "select_own_or_admin_docs" ON registration_documents
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT pilots.profile_id FROM pilot_registrations
      JOIN pilots ON pilots.id = pilot_registrations.pilot_id
      WHERE pilot_registrations.id = registration_id
    )
    OR is_admin()
  );

CREATE POLICY "admin_update_docs" ON registration_documents
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "admin_delete_docs" ON registration_documents
  FOR DELETE
  USING (is_admin());
