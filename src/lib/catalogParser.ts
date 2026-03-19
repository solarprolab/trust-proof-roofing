import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export interface CatalogItem {
  product_name: string;
  brand?: string | null;
  sku?: string | null;
  color?: string | null;
  unit?: string | null;
  unit_price?: number | null;
  availability?: string | null;
  lead_time_days?: number | null;
  category?: string | null;
  notes?: string | null;
}

export interface ParseResult {
  items: CatalogItem[];
  itemsAdded: number;
  itemsUpdated: number;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Parse-only: calls Claude and returns items without writing to DB
export async function parseCatalogText(rawText: string): Promise<CatalogItem[]> {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a roofing supply catalog parser. Extract all products from this distributor email or price list and return them as a JSON array.

For each product extract:
- product_name (required, string)
- brand (string or null)
- sku (string or null)
- color (string or null)
- unit (string or null — e.g. "square", "bundle", "roll", "sheet", "ea", "box", "linear ft")
- unit_price (number or null — dollar amount, no currency symbol)
- availability (one of: "in_stock", "limited", "out_of_stock", "unknown")
- lead_time_days (integer or null)
- category (one of: "shingles", "underlayment", "ice_water_shield", "flashing", "ventilation", "accessories", "fasteners", "gutters", "other")
- notes (string or null — any extra info)

Return ONLY a valid JSON array with no markdown fences and no explanation. If no products are found return [].

Email/document content:
${rawText.slice(0, 8000)}`,
      },
    ],
  });

  let items: CatalogItem[] = [];
  const content = message.content[0];
  if (content.type === 'text') {
    try {
      const text = content.text.trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const start = cleaned.indexOf('[');
      items = start >= 0 ? JSON.parse(cleaned.slice(start)) : [];
    } catch {
      items = [];
    }
  }
  return items;
}

// Save pre-parsed items to the DB, return counts
export async function saveItemsToCatalog(
  items: CatalogItem[],
  distributorId: string,
  rawText: string
): Promise<{ itemsAdded: number; itemsUpdated: number }> {
  const supabase = db();
  let itemsAdded = 0;
  let itemsUpdated = 0;

  for (const item of items) {
    if (!item.product_name?.trim()) continue;

    const matchField = item.sku ? 'sku' : 'product_name';
    const matchValue = item.sku || item.product_name;

    const { data: existing } = await supabase
      .from('distributor_catalog')
      .select('id')
      .eq('distributor_id', distributorId)
      .eq(matchField, matchValue)
      .maybeSingle();

    const record = {
      distributor_id: distributorId,
      product_name: item.product_name.trim(),
      brand: item.brand ?? null,
      sku: item.sku ?? null,
      color: item.color ?? null,
      unit: item.unit ?? null,
      unit_price: item.unit_price ?? null,
      availability: item.availability || 'unknown',
      lead_time_days: item.lead_time_days ?? null,
      category: item.category ?? null,
      notes: item.notes ?? null,
      last_updated: new Date().toISOString(),
      raw_source: rawText.slice(0, 500),
    };

    if (existing?.id) {
      await supabase.from('distributor_catalog').update(record).eq('id', existing.id);
      itemsUpdated++;
    } else {
      await supabase.from('distributor_catalog').insert(record);
      itemsAdded++;
    }
  }

  return { itemsAdded, itemsUpdated };
}

export async function parseEmailToCatalog(
  rawText: string,
  distributorId: string
): Promise<ParseResult> {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a roofing supply catalog parser. Extract all products from this distributor email or price list and return them as a JSON array.

For each product extract:
- product_name (required, string)
- brand (string or null)
- sku (string or null)
- color (string or null)
- unit (string or null — e.g. "square", "bundle", "roll", "sheet", "ea", "box", "linear ft")
- unit_price (number or null — dollar amount, no currency symbol)
- availability (one of: "in_stock", "limited", "out_of_stock", "unknown")
- lead_time_days (integer or null)
- category (one of: "shingles", "underlayment", "ice_water_shield", "flashing", "ventilation", "accessories", "fasteners", "gutters", "other")
- notes (string or null — any extra info)

Return ONLY a valid JSON array with no markdown fences and no explanation. If no products are found return [].

Email/document content:
${rawText.slice(0, 8000)}`,
      },
    ],
  });

  let items: CatalogItem[] = [];
  const content = message.content[0];
  if (content.type === 'text') {
    try {
      const text = content.text.trim();
      // Strip any accidental markdown fences
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const start = cleaned.indexOf('[');
      items = start >= 0 ? JSON.parse(cleaned.slice(start)) : [];
    } catch {
      items = [];
    }
  }

  const supabase = db();
  let itemsAdded = 0;
  let itemsUpdated = 0;

  for (const item of items) {
    if (!item.product_name?.trim()) continue;

    // Match by SKU if present, otherwise by product_name
    const matchField = item.sku ? 'sku' : 'product_name';
    const matchValue = item.sku || item.product_name;

    const { data: existing } = await supabase
      .from('distributor_catalog')
      .select('id')
      .eq('distributor_id', distributorId)
      .eq(matchField, matchValue)
      .maybeSingle();

    const record = {
      distributor_id: distributorId,
      product_name: item.product_name.trim(),
      brand: item.brand ?? null,
      sku: item.sku ?? null,
      color: item.color ?? null,
      unit: item.unit ?? null,
      unit_price: item.unit_price ?? null,
      availability: item.availability || 'unknown',
      lead_time_days: item.lead_time_days ?? null,
      category: item.category ?? null,
      notes: item.notes ?? null,
      last_updated: new Date().toISOString(),
      raw_source: rawText.slice(0, 500),
    };

    if (existing?.id) {
      await supabase.from('distributor_catalog').update(record).eq('id', existing.id);
      itemsUpdated++;
    } else {
      await supabase.from('distributor_catalog').insert(record);
      itemsAdded++;
    }
  }

  return { items, itemsAdded, itemsUpdated };
}
