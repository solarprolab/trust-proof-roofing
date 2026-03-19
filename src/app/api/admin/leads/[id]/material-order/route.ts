import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await db()
    .from('material_orders')
    .select('*')
    .eq('lead_id', params.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const supabase = db();

  // Upsert: update existing draft or insert new
  const { data: existing } = await supabase
    .from('material_orders')
    .select('id')
    .eq('lead_id', params.id)
    .eq('status', 'draft')
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from('material_orders')
      .update({ ...body, lead_id: params.id })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('material_orders')
    .insert({ ...body, lead_id: params.id, status: 'draft' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
