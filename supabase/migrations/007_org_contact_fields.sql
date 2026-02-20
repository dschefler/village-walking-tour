-- Add contact information fields to organizations
ALTER TABLE organizations
  ADD COLUMN contact_email VARCHAR(255),
  ADD COLUMN contact_phone VARCHAR(50),
  ADD COLUMN contact_address TEXT;
