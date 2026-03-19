import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { parseEmailToCatalog, stripHtml } from '@/lib/catalogParser';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Always return 200 so Resend does not retry
function ok() {
  return new NextResponse('OK', { status: 200 });
}

export async function POST(req: NextRequest) {
  let distributorId: string | null = null;
  let rawInput = '';

  try {
    // Optional: verify Resend webhook signature via RESEND_WEBHOOK_SECRET
    // Resend uses Svix headers (svix-id, svix-timestamp, svix-signature).
    // Install the `svix` package and verify here if strict security is needed.

    const payload = await req.json();

    // Resend inbound payload shape: { type: "email.received", data: { from, to, subject, text, html, ... } }
    if (payload?.type !== 'email.received') return ok();

    const { from, subject, text, html } = payload?.data ?? {};
    if (!from) return ok();

    // Normalise sender email — "Name <email@domain.com>" → "email@domain.com"
    const senderEmail = (from.match(/<([^>]+)>/) ?? [])[1]?.toLowerCase() || from.toLowerCase().trim();

    // Look up distributor by email
    const supabase = db();
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id, name, email')
      .ilike('email', senderEmail)
      .maybeSingle();

    if (!distributor) {
      console.log(`Inbound email from unknown sender: ${senderEmail} — subject: ${subject}`);
      return ok();
    }

    distributorId = distributor.id;

    // Extract plain text — prefer text, fall back to html stripped
    const bodyText: string | null = text?.trim()
      ? text.trim()
      : html?.trim()
      ? stripHtml(html)
      : null;

    if (!bodyText) {
      await supabase.from('catalog_sync_log').insert({
        distributor_id: distributorId,
        sync_method: 'email',
        items_added: 0,
        items_updated: 0,
        raw_input: '',
        status: 'skipped',
        error_notes: 'No text content in email',
      });
      return ok();
    }

    if (bodyText === null) {
      console.log(`No parseable text content for distributor ${distributor.name} — skipping`);
      return ok();
    }

    const safeBodyText = bodyText as string;

    rawInput = safeBodyText;

    const { itemsAdded, itemsUpdated } = await parseEmailToCatalog(safeBodyText, distributorId);

    // Log success
    await supabase.from('catalog_sync_log').insert({
      distributor_id: distributorId,
      sync_method: 'email',
      items_added: itemsAdded,
      items_updated: itemsUpdated,
      raw_input: rawInput.slice(0, 5000),
      status: 'success',
    });

    // Notify admin
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Trust Proof Roofing <info@trustproofroofing.com>',
      to: 'info@trustproofroofing.com',
      subject: `Catalog Synced — ${distributor.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#1B3A6B;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
            <p style="margin:0;font-size:12px;opacity:0.7;text-transform:uppercase">Trust Proof Roofing</p>
            <h2 style="margin:4px 0 0;font-size:18px">Catalog Synced — ${distributor.name}</h2>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
            <table style="font-size:14px;border-collapse:collapse">
              <tr><td style="color:#6b7280;padding:4px 16px 4px 0">Distributor</td><td style="color:#111827;font-weight:600">${distributor.name}</td></tr>
              <tr><td style="color:#6b7280;padding:4px 16px 4px 0">Sender</td><td style="color:#111827">${senderEmail}</td></tr>
              <tr><td style="color:#6b7280;padding:4px 16px 4px 0">Subject</td><td style="color:#111827">${subject || '—'}</td></tr>
              <tr><td style="color:#6b7280;padding:4px 16px 4px 0">Items added</td><td style="color:#16a34a;font-weight:600">+${itemsAdded}</td></tr>
              <tr><td style="color:#6b7280;padding:4px 16px 4px 0">Items updated</td><td style="color:#2563eb;font-weight:600">${itemsUpdated} updated</td></tr>
            </table>
          </div>
        </div>`,
    });
  } catch (err: any) {
    console.error('Resend inbound webhook error:', err);

    // Log the failure if we know which distributor this was for
    if (distributorId) {
      try {
        await db().from('catalog_sync_log').insert({
          distributor_id: distributorId,
          sync_method: 'email',
          items_added: 0,
          items_updated: 0,
          raw_input: rawInput.slice(0, 5000),
          status: 'error',
          error_notes: err.message || 'Unknown error',
        });
      } catch { /* swallow */ }
    }
  }

  // Always 200 — never let Resend retry
  return ok();
}
