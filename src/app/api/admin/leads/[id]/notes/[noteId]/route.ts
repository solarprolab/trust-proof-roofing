import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(_: Request, { params }: { params: { id: string; noteId: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabase.from('lead_notes').delete().eq('id', params.noteId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
