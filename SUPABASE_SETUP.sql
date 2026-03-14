-- Drop old tables
DROP TABLE IF EXISTS lead_notes CASCADE;
DROP TABLE IF EXISTS lead_files CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- Create leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  service TEXT,
  message TEXT,
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new','contacted','estimate_scheduled','estimate_sent','follow_up','won','in_progress','completed','lost')),
  source TEXT DEFAULT 'Website Form',
  quote_amount NUMERIC,
  job_value NUMERIC,
  roof_size TEXT,
  job_type TEXT,
  follow_up_date DATE,
  assigned_to TEXT DEFAULT 'Tenzin'
);

-- Create notes table
CREATE TABLE lead_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Tenzin'
);

-- Create files table
CREATE TABLE lead_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER
);

-- Create storage bucket (run in Supabase dashboard Storage section)
-- Bucket name: lead-files (public: false)
