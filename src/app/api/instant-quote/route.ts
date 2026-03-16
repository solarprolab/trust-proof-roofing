import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function fmt(n: number) { return '$' + n.toLocaleString(); }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, projectType, material, addOns, estimatedRange, sqft, pitchSurcharge } = body;

    const notesParts = [
      `Source: Instant Quote Tool`,
      `Project: ${projectType}`,
      sqft ? `Roof size: ~${sqft.toLocaleString()} sq ft` : null,
      pitchSurcharge > 0 ? `Pitch surcharge: ${pitchSurcharge}/sq ft` : null,
      material ? `Material: ${material}` : null,
      addOns?.length ? `Add-ons: ${addOns.join(', ')}` : null,
      estimatedRange?.[0] > 0 ? `Estimated range: ${fmt(estimatedRange[0])} – ${fmt(estimatedRange[1])}` : null,
    ].filter(Boolean).join(' | ');

    const { error: dbError } = await getSupabase().from('leads').insert([{
      name,
      email,
      phone,
      address,
      source: 'instant-quote',
      message: notesParts,
      service: projectType || null,
      roof_size: sqft ? String(sqft) : null,
      stage: 'new',
    }]);

    if (dbError) console.error('Supabase insert error:', dbError);

    // Owner notification
    await resend.emails.send({
      from: 'leads@trustproofroofing.com',
      to: 'info@trustproofroofing.com',
      subject: `New Instant Quote: ${name} — ${address}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <div style="background:#1B3C6B;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
            <h2 style="margin:0;font-size:18px">New Instant Quote Lead</h2>
            <p style="margin:4px 0 0;opacity:0.7;font-size:13px">Respond within 2 hours — SOP 01</p>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:20px 24px;border-radius:0 0 12px 12px">
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="color:#6b7280;padding:6px 0;width:120px">Name</td><td style="font-weight:600">${name}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Phone</td><td><a href="tel:${phone}" style="color:#1B3C6B">${phone}</a></td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Email</td><td><a href="mailto:${email}" style="color:#1B3C6B">${email}</a></td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Address</td><td>${address}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Project</td><td style="text-transform:capitalize">${projectType}</td></tr>
              ${sqft ? `<tr><td style="color:#6b7280;padding:6px 0">Roof size</td><td>~${sqft.toLocaleString()} sq ft</td></tr>` : ''}
              ${pitchSurcharge > 0 ? `<tr><td style="color:#6b7280;padding:6px 0">Pitch</td><td>${pitchSurcharge === 1 ? 'Steep' : 'Moderate'} (+$${pitchSurcharge}/sq ft surcharge)</td></tr>` : ''}
              ${material ? `<tr><td style="color:#6b7280;padding:6px 0">Material</td><td style="text-transform:capitalize">${material}</td></tr>` : ''}
              ${addOns?.length ? `<tr><td style="color:#6b7280;padding:6px 0">Add-ons</td><td>${addOns.join(', ')}</td></tr>` : ''}
            </table>
            ${estimatedRange?.[0] > 0 ? `
            <div style="background:#1B3C6B;color:#fff;border-radius:8px;padding:12px 16px;margin-top:16px">
              <p style="margin:0;font-size:11px;opacity:0.7">Estimated range shown to lead</p>
              <p style="margin:4px 0 0;font-size:20px;font-weight:700">${fmt(estimatedRange[0])} – ${fmt(estimatedRange[1])}</p>
            </div>` : ''}
          </div>
        </div>`,
    });

    // Customer confirmation
    if (email) {
      await resend.emails.send({
        from: 'Tenzin at Trust Proof Roofing <info@trustproofroofing.com>',
        to: email,
        subject: 'Your roof estimate — Trust Proof Roofing',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
            <p style="font-size:15px">Hi ${name},</p>
            <p style="font-size:14px;color:#374151">Thanks for reaching out. I received your estimate request for <strong>${address}</strong> and I'll personally review it and get back to you within 2 hours during business hours.</p>
            ${estimatedRange?.[0] > 0 ? `
            <div style="background:#1B3C6B;color:#fff;border-radius:10px;padding:16px 20px;margin:20px 0">
              <p style="margin:0;font-size:11px;opacity:0.7">Your estimated range</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:700">${fmt(estimatedRange[0])} – ${fmt(estimatedRange[1])}</p>
              <p style="margin:6px 0 0;font-size:11px;opacity:0.6">Exact price confirmed after free drone assessment</p>
            </div>` : estimatedRange === null ? `
            <div style="background:#1B3C6B;color:#fff;border-radius:10px;padding:16px 20px;margin:20px 0;text-align:center">
              <p style="margin:0;font-size:18px;font-weight:700">Free Drone Assessment</p>
              <p style="margin:6px 0 0;font-size:12px;opacity:0.75">No charge · No obligation · Full roof video</p>
            </div>` : ''}
            <p style="font-size:14px;color:#374151">Every replacement I do comes with a <strong>20-year leak warranty</strong> — not a manufacturer program, my personal commitment in writing.</p>
            <p style="font-size:14px;color:#374151">— Tenzin Thupten, Founder<br>Trust Proof Roofing<br><a href="tel:9593338569" style="color:#1B3C6B">(959) 333-8569</a></p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="font-size:11px;color:#9ca3af">Trust Proof Roofing LLC · 141 Quail Run Rd, Suffield, CT 06078 · CT HIC #HIC.0703927</p>
          </div>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Instant quote error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
