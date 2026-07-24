ALTER TABLE pilots ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE pilots ADD COLUMN IF NOT EXISTS document_number TEXT;

ALTER TABLE pilots DROP CONSTRAINT IF EXISTS pilots_document_type_check;
ALTER TABLE pilots ADD CONSTRAINT pilots_document_type_check
  CHECK (
    (document_type IS NULL AND document_number IS NULL)
    OR
    (
      document_type IN ('CPF','RG','CIN')
      AND length(trim(document_number)) > 0
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_pilots_document
  ON pilots(document_type, document_number)
  WHERE document_type IS NOT NULL AND document_number IS NOT NULL;
