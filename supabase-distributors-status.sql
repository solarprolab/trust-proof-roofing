-- Add status column to distributors table
-- Run this in Supabase SQL Editor

ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'inactive'));

-- Add service_area column for registrations
ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS service_area text;

-- Set all existing distributors to active
UPDATE distributors SET status = 'active' WHERE status IS NULL;
