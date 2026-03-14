import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data, error } = await getSupabase()
    .from('lead_notes')
    .select('*')
    .eq('lead_id', params.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { content } = await req.json();
  const { data, error } = await getSupabase()
    .from('lead_notes')
    .insert({ lead_id: params.id, content, author: 'Tenzin' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
