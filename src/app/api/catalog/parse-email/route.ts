import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseEmailToCatalog } from '@/lib/catalogParser';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST /api/catalog/parse-email
// Body: { distributorId: string, rawText: string }
export async function POST(req: NextRequest) {
  try {
    const { distributorId, rawText } = await req.json();

    if (!distributorId || !rawText?.trim()) {
      return NextResponse.json({ error: 'distributorId and rawText are required' }, { status: 400 });
    }

    const { items, itemsAdded, itemsUpdated } = await parseEmailToCatalog(rawText, distributorId);

    // Log to catalog_sync_log
    await db().from('catalog_sync_log').insert({
      distributor_id: distributorId,
      sync_method: 'manual',
      items_added: itemsAdded,
      items_updated: itemsUpdated,
      raw_input: rawText.slice(0, 5000),
      status: 'success',
    });

    return NextResponse.json({ success: true, itemsAdded, itemsUpdated, itemCount: items.length });
  } catch (err: any) {
    console.error('parse-email error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
