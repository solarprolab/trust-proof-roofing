import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  console.log('[admin/leads] SUPABASE_URL prefix:', process.env.SUPABASE_URL?.slice(0, 10));
  console.log('[admin/leads] SUPABASE_SERVICE_ROLE_KEY prefix:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10));
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[admin/leads] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('[admin/leads] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from('leads').insert([body]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
