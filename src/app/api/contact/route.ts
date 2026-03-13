export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, service, message } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required.' }, { status: 400 });
    }

    // Insert lead into Supabase
    await getSupabase().from('leads').insert([
      { name, email, phone, service: service || null, message: message || null, source: 'Website Form', stage: 'new' },
    ]);

    const firstName = name.split(' ')[0];

    // Notification email to owner
    await resend.emails.send({
      from: 'leads@trustproofroofing.com',
      to: 'info@trustproofroofing.com',
      subject: `New Lead: ${name} — ${service || 'General Inquiry'}`,
      html: `
        <h2 style="color:#1c4735;">New Lead from Trust Proof Roofing</h2>
        <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr style="background:#f0f7f4;"><td style="border:1px solid #d9ede2;font-weight:bold;">Name</td><td style="border:1px solid #d9ede2;">${name}</td></tr>
          <tr><td style="border:1px solid #d9ede2;font-weight:bold;">Email</td><td style="border:1px solid #d9ede2;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr style="background:#f0f7f4;"><td style="border:1px solid #d9ede2;font-weight:bold;">Phone</td><td style="border:1px solid #d9ede2;"><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td style="border:1px solid #d9ede2;font-weight:bold;">Service</td><td style="border:1px solid #d9ede2;">${service || '—'}</td></tr>
          <tr style="background:#f0f7f4;"><td style="border:1px solid #d9ede2;font-weight:bold;">Message</td><td style="border:1px solid #d9ede2;">${message || '—'}</td></tr>
        </table>
      `,
    });

    // Confirmation email to customer
    await resend.emails.send({
      from: 'noreply@trustproofroofing.com',
      to: email,
      subject: `We received your request, ${firstName}!`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1c4735;padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;">🛡️ Trust Proof Roofing</h1>
            <p style="color:#b5dbc7;margin:8px 0 0;">Roofing You Can Trust — Backed by Proof</p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:18px;color:#1c4735;">Hi ${firstName},</p>
            <p>Thank you for reaching out to Trust Proof Roofing. We've received your request and will be in touch within 1 business day.</p>
            ${service ? `<div style="background:#f0f7f4;border-left:4px solid #276e4f;padding:16px;margin:20px 0;border-radius:4px;"><strong style="color:#1c4735;">Service Requested:</strong> ${service}</div>` : ''}
            <h3 style="color:#1c4735;">What to expect next:</h3>
            <ol style="color:#374151;line-height:1.8;">
              <li>We review your request and contact details</li>
              <li>We call or email you to understand your situation</li>
              <li>We schedule a roof inspection at your convenience</li>
              <li>You receive a detailed written estimate — no obligation</li>
            </ol>
            <div style="text-align:center;margin:32px 0;">
              <a href="tel:9593338569" style="display:inline-block;background:#e98825;color:white;font-weight:bold;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;">
                📞 Call (959) 333-8569
              </a>
            </div>
            <p style="font-size:14px;color:#6b7280;">
              Questions? Call us anytime: (959) 333-8569<br>
              CT License #HIC.0703927
            </p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af;">
            © ${new Date().getFullYear()} Trust Proof Roofing · Suffield, CT 06078 · CT License #HIC.0703927
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
