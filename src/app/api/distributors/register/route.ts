import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const LEAD_TIME_DAYS: Record<string, number> = {
  'same-day': 0,
  '1-2': 2,
  '3-5': 5,
  '1week+': 7,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, contact_name, phone, email,
      account_number, tax_exempt_number, billing_address,
      preferred_brands, lead_time, delivery_minimum,
      notes, service_area,
    } = body;

    if (!name?.trim() || !contact_name?.trim() || !phone?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const supabase = db();
    const { data, error } = await supabase
      .from('distributors')
      .insert({
        name: name.trim(),
        contact_name: contact_name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        account_number: account_number?.trim() || null,
        tax_exempt_number: tax_exempt_number?.trim() || null,
        billing_address: billing_address?.trim() || null,
        preferred_brands: preferred_brands || [],
        typical_lead_time_days: lead_time ? (LEAD_TIME_DAYS[lead_time] ?? null) : null,
        delivery_minimum: delivery_minimum?.trim() || null,
        notes: notes?.trim() || null,
        service_area: service_area?.trim() || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const brandsStr = (preferred_brands || []).join(', ') || '—';
    const leadTimeLabel = {
      'same-day': 'Same day', '1-2': '1–2 days', '3-5': '3–5 days', '1week+': '1 week+',
    }[lead_time as string] || '—';

    // Notify admin
    await resend.emails.send({
      from: 'Trust Proof Roofing <info@trustproofroofing.com>',
      to: 'info@trustproofroofing.com',
      subject: `New Supplier Registration — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1B3A6B;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
            <p style="margin:0;font-size:12px;opacity:0.7;text-transform:uppercase">Trust Proof Roofing</p>
            <h2 style="margin:4px 0 0;font-size:20px">New Supplier Registration</h2>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#6b7280;width:180px">Company</td><td style="padding:6px 0;color:#111827;font-weight:600">${name}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280">Contact</td><td style="padding:6px 0;color:#111827">${contact_name}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0;color:#111827">${phone}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0;color:#111827">${email}</td></tr>
              ${account_number ? `<tr><td style="padding:6px 0;color:#6b7280">Account #</td><td style="padding:6px 0;color:#111827">${account_number}</td></tr>` : ''}
              ${tax_exempt_number ? `<tr><td style="padding:6px 0;color:#6b7280">Tax Exempt #</td><td style="padding:6px 0;color:#111827">${tax_exempt_number}</td></tr>` : ''}
              ${billing_address ? `<tr><td style="padding:6px 0;color:#6b7280">Billing Address</td><td style="padding:6px 0;color:#111827">${billing_address}</td></tr>` : ''}
              <tr><td style="padding:6px 0;color:#6b7280">Brands</td><td style="padding:6px 0;color:#111827">${brandsStr}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280">Lead Time</td><td style="padding:6px 0;color:#111827">${leadTimeLabel}</td></tr>
              ${delivery_minimum ? `<tr><td style="padding:6px 0;color:#6b7280">Delivery Min</td><td style="padding:6px 0;color:#111827">${delivery_minimum}</td></tr>` : ''}
              ${service_area ? `<tr><td style="padding:6px 0;color:#6b7280">Service Area</td><td style="padding:6px 0;color:#111827">${service_area}</td></tr>` : ''}
              ${notes ? `<tr><td style="padding:6px 0;color:#6b7280;vertical-align:top">Notes</td><td style="padding:6px 0;color:#111827">${notes}</td></tr>` : ''}
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <a href="https://trustproofroofing.com/admin/distributors" style="display:inline-block;background:#1B3A6B;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600">
              Review in Admin →
            </a>
          </div>
        </div>`,
    });

    // Confirm to distributor
    await resend.emails.send({
      from: 'Tenzin at Trust Proof Roofing <info@trustproofroofing.com>',
      to: email,
      subject: 'Thanks for registering — Trust Proof Roofing',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#1B3A6B;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
            <p style="margin:0;font-size:12px;opacity:0.7;text-transform:uppercase">Trust Proof Roofing</p>
            <h2 style="margin:4px 0 0;font-size:18px">Thanks for reaching out, ${contact_name.split(' ')[0]}!</h2>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
            <p style="font-size:15px;color:#374151;line-height:1.6">
              Thank you for your interest in joining our supplier network. We have received your information
              and will be in touch within 24 hours.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.6;margin-top:16px">
              — Tenzin<br>
              Trust Proof Roofing<br>
              <a href="tel:9593338569" style="color:#1B3A6B">(959) 333-8569</a>
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="font-size:12px;color:#9ca3af">Trust Proof Roofing LLC · Suffield, CT · CT HIC #HIC.0703927</p>
          </div>
        </div>`,
    });

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    console.error('Distributor registration error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
