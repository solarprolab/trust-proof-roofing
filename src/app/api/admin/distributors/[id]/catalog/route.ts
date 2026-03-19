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
    .from('distributor_catalog')
    .select('*')
    .eq('distributor_id', params.id)
    .order('category', { ascending: true })
    .order('product_name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await db()
    .from('distributor_catalog')
    .delete()
    .eq('distributor_id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
