import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function fmt(n: number) { return '$' + Math.round(n).toLocaleString(); }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, phone, address, sqft, material, pitchCategory,
      addOns, layers, priceRange, scopeNotes,
    } = body;

    const [low, high] = priceRange as [number, number];
    const materialLabel = material === 'premium'
      ? 'Premium Asphalt (GAF Timberline UHDZ, 50-yr mfr warranty)'
      : 'Standard Asphalt (GAF Timberline HDZ, 30-yr mfr warranty)';
    const addOnsLabel = (addOns as string[]).join(', ') || 'None';
    const layersLabel = layers === 2 ? '2 layers (+$500)' : '1 layer (included)';

    // Email 1 — Owner notification
    await resend.emails.send({
      from: 'leads@trustproofroofing.com',
      to: 'info@trustproofroofing.com',
      subject: `Quote Sent: ${name} — ${address}`,
      html: `
        <div style="font-family:sans-serif;max-width:540px;margin:0 auto">
          <div style="background:#1B3C6B;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
            <h2 style="margin:0;font-size:18px">Quote Sent to Homeowner</h2>
            <p style="margin:4px 0 0;opacity:0.7;font-size:13px">CRM Quote Builder — Trust Proof Roofing</p>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:20px 24px;border-radius:0 0 12px 12px">
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="color:#6b7280;padding:6px 0;width:140px">Name</td><td style="font-weight:600">${name}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Address</td><td>${address}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Phone</td><td><a href="tel:${phone}" style="color:#1B3C6B">${phone}</a></td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Email</td><td><a href="mailto:${email}" style="color:#1B3C6B">${email}</a></td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Roof Area</td><td>${Number(sqft).toLocaleString()} sq ft</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Material</td><td>${materialLabel}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Pitch</td><td>${pitchCategory}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Add-ons</td><td>${addOnsLabel}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Layers</td><td>${layersLabel}</td></tr>
            </table>
            <div style="background:#1B3C6B;color:#fff;border-radius:8px;padding:14px 18px;margin-top:16px">
              <p style="margin:0;font-size:11px;opacity:0.7">Price Range Sent</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:700">${fmt(low)} – ${fmt(high)}</p>
            </div>
            ${scopeNotes ? `<div style="margin-top:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px"><p style="margin:0;font-size:12px;color:#6b7280;font-weight:600;margin-bottom:4px">Scope Notes</p><p style="margin:0;font-size:13px;color:#374151">${scopeNotes}</p></div>` : ''}
          </div>
        </div>`,
    });

    // Email 2 — Homeowner quote
    await resend.emails.send({
      from: 'Tenzin at Trust Proof Roofing <info@trustproofroofing.com>',
      to: email,
      subject: 'Your Roofing Quote — Trust Proof Roofing',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <!-- Header -->
          <div style="background:#1B3C6B;color:#fff;padding:24px 28px;border-radius:12px 12px 0 0;text-align:center">
            <p style="margin:0;font-size:13px;opacity:0.7;letter-spacing:0.05em;text-transform:uppercase">Trust Proof Roofing</p>
            <h1 style="margin:6px 0 0;font-size:22px;font-weight:800">Your Personalized Roofing Quote</h1>
          </div>

          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px 28px;border-radius:0 0 12px 12px">
            <p style="font-size:15px;color:#111827;margin-top:0">Hi ${name},</p>
            <p style="font-size:14px;color:#374151;line-height:1.6">I've reviewed your property at <strong>${address}</strong> and put together a detailed quote based on your roof's measurements and specifications.</p>

            <!-- Price range box -->
            <div style="background:#1B3C6B;color:#fff;border-radius:10px;padding:20px 24px;margin:20px 0;text-align:center">
              <p style="margin:0;font-size:12px;opacity:0.7;text-transform:uppercase;letter-spacing:0.05em">Estimated Project Range</p>
              <p style="margin:8px 0 4px;font-size:32px;font-weight:800;line-height:1">${fmt(low)} – ${fmt(high)}</p>
              <p style="margin:0;font-size:12px;opacity:0.6">Exact price confirmed after free drone assessment</p>
            </div>

            <!-- Quote details table -->
            <h3 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Quote Details</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
              <tr style="border-bottom:1px solid #f3f4f6">
                <td style="color:#6b7280;padding:9px 0;width:160px">Roof Area</td>
                <td style="font-weight:600;color:#111827">${Number(sqft).toLocaleString()} sq ft</td>
              </tr>
              <tr style="border-bottom:1px solid #f3f4f6">
                <td style="color:#6b7280;padding:9px 0">Material</td>
                <td style="font-weight:600;color:#111827">${materialLabel}</td>
              </tr>
              <tr style="border-bottom:1px solid #f3f4f6">
                <td style="color:#6b7280;padding:9px 0">Pitch</td>
                <td style="font-weight:600;color:#111827">${pitchCategory}</td>
              </tr>
              <tr style="border-bottom:1px solid #f3f4f6">
                <td style="color:#6b7280;padding:9px 0">Add-ons included</td>
                <td style="font-weight:600;color:#111827">${addOnsLabel}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;padding:9px 0">Layers to remove</td>
                <td style="font-weight:600;color:#111827">${layersLabel}</td>
              </tr>
            </table>

            <!-- What's included -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:20px">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#15803d">Always included in your price:</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">✓ Full ice &amp; water shield</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">✓ Fascia &amp; drip edge</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">✓ Full cleanup &amp; magnetic nail sweep</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">✓ 20-year personal leak warranty</p>
            </div>

            <!-- Personal note -->
            <p style="font-size:14px;color:#374151;line-height:1.6">Every replacement I do comes with a <strong>20-year leak warranty</strong> — not a manufacturer program, my personal commitment in writing. I'd love to schedule a free drone assessment so you can see your roof in detail before we start anything.</p>

            <!-- CTA -->
            <div style="text-align:center;margin:24px 0">
              <a href="https://trustproofroofing.com/contact" style="display:inline-block;background:#1B3C6B;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px">
                Schedule Free Drone Assessment →
              </a>
            </div>

            <!-- Signature -->
            <p style="font-size:14px;color:#374151;line-height:1.8;margin-top:20px">
              — Tenzin, Founder<br>
              <strong>Trust Proof Roofing</strong><br>
              <a href="tel:9593338569" style="color:#1B3C6B;text-decoration:none">(959) 333-8569</a><br>
              <a href="https://trustproofroofing.com" style="color:#1B3C6B;text-decoration:none">trustproofroofing.com</a><br>
              CT HIC #HIC.0703927
            </p>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="font-size:11px;color:#9ca3af;text-align:center">Trust Proof Roofing · Suffield, CT 06078 · CT HIC #HIC.0703927</p>
          </div>
        </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Send quote error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
