import { NextRequest, NextResponse } from 'next/server';

function getHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

export async function GET() {
  try {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('SUPABASE_SERVICE_ROLE_KEY prefix:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10));
    if (!key) {
      return NextResponse.json({ error: 'Missing env var: SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const res = await fetch(
      'https://cabsxmqewbnyylzbzbp.supabase.com/rest/v1/leads?select=*&order=created_at.desc',
      { headers: getHeaders() }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: `Supabase error: ${res.status}`, details: data }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Caught: ${message}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(
      'https://cabsxmqewbnyylzbzbp.supabase.com/rest/v1/leads',
      {
        method: 'POST',
        headers: { ...getHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: `Supabase error: ${res.status}`, details: data }, { status: 500 });
    }

    return NextResponse.json(Array.isArray(data) ? data[0] : data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Caught: ${message}` }, { status: 500 });
  }
}
