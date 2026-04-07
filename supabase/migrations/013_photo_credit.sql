-- Add photo_credit field to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS photo_credit TEXT;
