import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(_: Request, { params }: { params: { id: string; fileId: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabase.from('lead_files').delete().eq('id', params.fileId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
