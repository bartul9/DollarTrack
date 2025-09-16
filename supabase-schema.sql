-- Supabase schema for DollarTrack
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL,
  icon text NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric(10, 2) NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  date timestamp NOT NULL DEFAULT now(),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_category_id_idx ON expenses(category_id);

INSERT INTO categories (name, color, icon) VALUES
  ('Food & Dining', '#3B82F6', 'utensils'),
  ('Transport', '#10B981', 'car'),
  ('Entertainment', '#8B5CF6', 'film'),
  ('Utilities', '#F59E0B', 'zap'),
  ('Healthcare', '#EF4444', 'heart'),
  ('Shopping', '#EC4899', 'shopping-bag'),
  ('Education', '#06B6D4', 'book'),
  ('Other', '#6B7280', 'more-horizontal')
ON CONFLICT (name) DO NOTHING;
