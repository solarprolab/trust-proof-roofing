-- ─── Distributors ───────────────────────────────────────────────────────────
CREATE TABLE distributors (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name             text NOT NULL,
  contact_name     text,
  phone            text,
  email            text,
  account_number   text,
  tax_exempt_number text,
  billing_address  text,
  preferred_brands text[],
  typical_lead_time_days integer,
  delivery_minimum text,
  notes            text,
  created_at       timestamptz DEFAULT now()
);

-- ─── Material Orders ─────────────────────────────────────────────────────────
CREATE TABLE material_orders (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id         text NOT NULL,
  distributor_id  uuid REFERENCES distributors(id) ON DELETE SET NULL,
  po_number       text,
  order_data      jsonb DEFAULT '{}',
  status          text DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  created_at      timestamptz DEFAULT now(),
  sent_at         timestamptz
);

CREATE INDEX material_orders_lead_id_idx ON material_orders(lead_id);
