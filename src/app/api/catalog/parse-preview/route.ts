import { NextRequest, NextResponse } from 'next/server';
import { parseCatalogText } from '@/lib/catalogParser';

// POST /api/catalog/parse-preview
// Parses text with Claude and returns items WITHOUT saving to DB.
// Body: { rawText: string }
export async function POST(req: NextRequest) {
  try {
    const { rawText } = await req.json();

    if (!rawText?.trim()) {
      return NextResponse.json({ error: 'rawText is required' }, { status: 400 });
    }

    const items = await parseCatalogText(rawText);
    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('parse-preview error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
