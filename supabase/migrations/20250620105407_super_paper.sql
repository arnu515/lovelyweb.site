/*
  # Create organisations table

  1. New Tables
    - `organisations`
      - `id` (text, primary key) - kebab-case slug
      - `name` (text, not null) - display name
      - `link` (text, nullable) - website/link
      - `description` (text, nullable) - organisation description
      - `plan` (text, not null, default 'free') - pricing plan
      - `owner_id` (uuid, foreign key) - references users.id
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `organisations` table
    - Add policy for users to read organisations they belong to
    - Add policy for users to create organisations
    - Add policy for owners to update their organisations

  3. Changes
    - Add unique constraint on organisation id
    - Add check constraint for valid plans
*/

CREATE TABLE IF NOT EXISTS organisations (
  id text PRIMARY KEY,
  name text NOT NULL,
  link text,
  description text,
  plan text NOT NULL DEFAULT 'free',
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add check constraint for valid plans
ALTER TABLE organisations ADD CONSTRAINT valid_plan 
  CHECK (plan IN ('free', 'basic', 'pro'));

-- Enable RLS
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read organisations they own"
  ON organisations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create organisations"
  ON organisations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their organisations"
  ON organisations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_organisations_updated_at
  BEFORE UPDATE ON organisations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();