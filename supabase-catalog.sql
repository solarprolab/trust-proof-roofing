CREATE TABLE IF NOT EXISTS distributor_catalog (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id uuid REFERENCES distributors(id) ON DELETE CASCADE,
  category text,
  product_name text NOT NULL,
  brand text,
  sku text,
  color text,
  unit text,
  unit_price numeric(10,2),
  availability text DEFAULT 'unknown',
  lead_time_days integer,
  notes text,
  last_updated timestamptz DEFAULT now(),
  raw_source text
);

CREATE TABLE IF NOT EXISTS catalog_sync_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id uuid REFERENCES distributors(id),
  sync_method text,
  items_updated integer,
  items_added integer,
  raw_input text,
  parsed_at timestamptz DEFAULT now(),
  status text,
  error_notes text
);

CREATE INDEX IF NOT EXISTS catalog_distributor_idx ON distributor_catalog(distributor_id);
CREATE INDEX IF NOT EXISTS catalog_category_idx ON distributor_catalog(category);
