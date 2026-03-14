import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data, error } = await getSupabase()
    .from('lead_files')
    .select('*')
    .eq('lead_id', params.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabase();
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const fileName = `${params.id}/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from('lead-files')
    .upload(fileName, buffer, { contentType: file.type });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from('lead-files').getPublicUrl(fileName);

  const { data, error } = await supabase.from('lead_files').insert({
    lead_id: params.id,
    file_name: file.name,
    file_url: publicUrl,
    file_type: file.type,
    file_size: file.size,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
