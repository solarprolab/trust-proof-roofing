import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function fmtMoney(n: number) { return '$' + Math.round(n).toLocaleString(); }

/* ─── Types ───────────────────────────────────────────── */
interface QuoteSection {
  name: string;
  sqft: number;
  sqftWithWaste: number;
  pitch: number;
  workType: 'replace' | 'repair';
  layers: 1 | 2;
  wastePercent: number;
}

interface LinearMeasurements {
  ridge: number;
  valley: number;
  rake: number;
  eave: number;
}

interface LineItem {
  label: string;
  amount: number;
}

interface PriceBreakdown {
  lineItems: LineItem[];
  subtotal: number;
  rangeMin: number;
  rangeMax: number;
}

/* ─── PDF generation ──────────────────────────────────── */
function generateProposalPDF(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  sections: QuoteSection[];
  linearMeasurements: LinearMeasurements;
  addOns: string[];
  skylights: number;
  chimneys: number;
  material: string;
  priceBreakdown: PriceBreakdown;
  scopeNotes?: string;
  leadId: string;
}): string {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  const NAVY  = [27, 60, 107] as const;
  const WHITE = [255, 255, 255] as const;
  const GRAY  = [100, 100, 100] as const;
  const DARK  = [30, 30, 30] as const;
  const LG    = [248, 249, 250] as const;

  const { rangeMin, rangeMax, lineItems, subtotal } = data.priceBreakdown;
  const materialLabel = data.material === 'premium'
    ? 'Premium Asphalt (GAF Timberline UHDZ)'
    : 'Standard Asphalt (GAF Timberline HDZ)';
  const warrantyLabel = data.material === 'premium' ? '50-year manufacturer warranty' : '30-year manufacturer warranty';
  const proposalNum = `TPR-${data.leadId.slice(-6).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const totalSqft = data.sections.reduce((s, sec) => s + sec.sqft, 0);
  const replaceSections = data.sections.filter(s => s.workType === 'replace');
  const repairSections  = data.sections.filter(s => s.workType === 'repair');

  function addFooter(pageNum: number) {
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.4);
    doc.line(12, ph - 14, pw - 12, ph - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(
      'Trust Proof Roofing LLC · Suffield, CT 06078 · (959) 333-8569 · trustproofroofing.com · CT HIC #HIC.0703927',
      pw / 2, ph - 9, { align: 'center' }
    );
    doc.text(`Page ${pageNum}`, pw - 12, ph - 9, { align: 'right' });
  }

  /* ═══════════════ PAGE 1 ═══════════════ */

  // Header bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pw, 30, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TRUST PROOF ROOFING', 12, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('ROOFING PROPOSAL', 12, 21);
  doc.setFontSize(8);
  doc.text('CT HIC #HIC.0703927', pw - 12, 11, { align: 'right' });
  doc.text('(959) 333-8569',       pw - 12, 17, { align: 'right' });
  doc.text('trustproofroofing.com', pw - 12, 23, { align: 'right' });

  // Prepared for
  let y = 38;
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`Prepared for: ${data.name}`, 12, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  y += 7;  doc.text(data.address, 12, y);
  y += 5;  doc.text(data.phone,   12, y);
  y += 5;  doc.text(data.email,   12, y);

  doc.setTextColor(80, 80, 80);
  doc.text(`Date: ${dateStr}`, pw - 12, 38, { align: 'right' });
  doc.text(`Proposal #: ${proposalNum}`, pw - 12, 44, { align: 'right' });

  // Divider
  y += 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(12, y, pw - 12, y);
  y += 8;

  // ROOF SECTION BREAKDOWN
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ROOF SECTION BREAKDOWN', 12, y);
  y += 4;

  const sectionRows = data.sections.map(sec => {
    const pitchStr = sec.pitch === 0 ? 'Flat (0°)' :
      sec.pitch < 18 ? `Low (${sec.pitch}°)` :
      sec.pitch < 30 ? `Moderate (${sec.pitch}°)` :
      sec.pitch < 40 ? `Steep (${sec.pitch}°)` :
      `Very Steep (${sec.pitch}°)`;
    const wasteStr = sec.workType === 'replace'
      ? `${sec.sqft.toLocaleString()} → ${sec.sqftWithWaste.toLocaleString()} sq ft (+${sec.wastePercent}%)`
      : `${sec.sqft.toLocaleString()} sq ft`;
    return [
      sec.name,
      pitchStr,
      sec.workType === 'replace' ? 'Replace' : 'Repair',
      sec.layers === 2 ? '2 layers' : '1 layer',
      wasteStr,
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: 12, right: 12 },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [...NAVY] as [number, number, number], textColor: [...WHITE] as [number, number, number], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [...LG] as [number, number, number] },
    head: [['Section', 'Pitch', 'Work Type', 'Layers', 'Area (w/ waste)']],
    body: sectionRows,
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 38 },
      4: { cellWidth: 52 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // PROJECT DETAILS
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PROJECT DETAILS', 12, y);
  y += 4;

  const detailRows: [string, string][] = [
    ['Total Roof Area', `${totalSqft.toLocaleString()} sq ft (${data.sections.length} section${data.sections.length !== 1 ? 's' : ''})`],
    ['Material', materialLabel],
    ['Manufacturer Warranty', warrantyLabel],
  ];
  if (replaceSections.length) detailRows.push(['Replacement Sections', `${replaceSections.length} section${replaceSections.length !== 1 ? 's' : ''}`]);
  if (repairSections.length)  detailRows.push(['Repair Sections', `${repairSections.length} section${repairSections.length !== 1 ? 's' : ''}`]);
  if (data.addOns.length)     detailRows.push(['Add-ons', data.addOns.join(', ')]);
  if (data.skylights > 0)     detailRows.push(['Skylights (flashing)', `${data.skylights}`]);
  if (data.chimneys > 0)      detailRows.push(['Chimneys (flashing)', `${data.chimneys}`]);
  detailRows.push(['Gutter Inspection', 'Complimentary']);

  autoTable(doc, {
    startY: y,
    margin: { left: 12, right: 12 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 58, textColor: [80, 80, 80] },
      1: { textColor: [30, 30, 30] },
    },
    alternateRowStyles: { fillColor: [...LG] as [number, number, number] },
    body: detailRows,
    showHead: false,
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // PRICE BREAKDOWN
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PRICE BREAKDOWN', 12, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 12, right: 12 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { textColor: [60, 60, 60] },
      1: { textColor: [30, 30, 30], halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [...LG] as [number, number, number] },
    foot: [['Subtotal', fmtMoney(subtotal)]],
    footStyles: { fillColor: [240, 240, 240], textColor: [30, 30, 30], fontStyle: 'bold', fontSize: 9, halign: 'right' },
    body: lineItems.map(li => [li.label, fmtMoney(li.amount)]),
    showHead: false,
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ESTIMATED INVESTMENT
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ESTIMATED INVESTMENT', 12, y);
  y += 6;

  const boxH = 30;
  doc.setFillColor(...NAVY);
  doc.roundedRect(12, y, pw - 24, boxH, 3, 3, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Estimated Project Range', pw / 2, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(`${fmtMoney(rangeMin)} – ${fmtMoney(rangeMax)}`, pw / 2, y + 20, { align: 'center' });

  y += boxH + 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('Final price confirmed after free drone assessment. Price valid for 30 days.', pw / 2, y, { align: 'center' });
  y += 8;

  // Scope notes
  if (data.scopeNotes?.trim()) {
    const maxNoteW  = pw - 32;
    const noteLines = doc.splitTextToSize(data.scopeNotes.trim(), maxNoteW);
    const notesH    = 10 + noteLines.length * 5;
    doc.setFillColor(...LG);
    doc.setDrawColor(210, 210, 210);
    doc.rect(12, y, pw - 24, notesH, 'FD');
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Project Notes:', 16, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(noteLines, 16, y + 12);
  }

  addFooter(1);

  /* ═══════════════ PAGE 2 ═══════════════ */
  doc.addPage();
  y = 20;

  // WHAT IS ALWAYS INCLUDED
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('WHAT IS ALWAYS INCLUDED', 12, y);
  y += 8;

  const leftItems  = ['Full ice & water shield', 'Fascia & drip edge installation', 'Magnetic nail sweep', 'All permits and inspections'];
  const rightItems = ['Full photo documentation', 'Real-time project updates', '20-year leak warranty', 'Debris removal & cleanup'];
  const col2x      = pw / 2 + 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  leftItems.forEach( (item, i) => doc.text(`• ${item}`, 16, y + i * 6));
  rightItems.forEach((item, i) => doc.text(`• ${item}`, col2x, y + i * 6));
  y += leftItems.length * 6 + 12;

  // 20-Year Warranty
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('OUR 20-YEAR LEAK WARRANTY', 12, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const warrantyText = 'Trust Proof Roofing warrants all roof replacement workmanship against leaks for 20 years from the date of completion. If your roof leaks due to a workmanship defect within the warranty period, we will repair it at no additional cost. This warranty is transferable to new owners with written notice.';
  const wLines = doc.splitTextToSize(warrantyText, pw - 24);
  doc.text(wLines, 12, y);
  y += wLines.length * 5 + 12;

  // Why Trust Proof Roofing
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('WHY TRUST PROOF ROOFING', 12, y);
  y += 8;

  const reasons = [
    {
      title: 'Transparency',
      body: 'We fly a drone over your roof before any work begins. You see what we see — every issue documented with footage you own. No surprises.',
    },
    {
      title: 'Documentation',
      body: 'Photos throughout the project, a signed written proposal before we start, and a written warranty at completion. No verbal agreements, ever.',
    },
    {
      title: 'Quality',
      body: 'Manufacturer-specification installation on every job. Licensed and insured in Connecticut. CT HIC #HIC.0703927.',
    },
  ];

  reasons.forEach(r => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(r.title, 12, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(r.body, pw - 24);
    doc.text(lines, 12, y);
    y += lines.length * 5 + 7;
  });

  // Next Steps
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('NEXT STEPS', 12, y);
  y += 8;

  const steps = [
    'Schedule your free drone assessment',
    'Review detailed written proposal with exact pricing',
    'Sign contract and schedule installation',
    'Installation with daily photo updates',
    'Final walkthrough and warranty documentation',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  steps.forEach((step, i) => {
    doc.text(`${i + 1}.  ${step}`, 16, y);
    y += 7;
  });

  addFooter(2);

  return Buffer.from(doc.output('arraybuffer')).toString('base64');
}

/* ─── Route handler ───────────────────────────────────── */
export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await req.json();
    const {
      name, email, phone, address,
      sections, linearMeasurements, addOns, skylights, chimneys,
      material, priceBreakdown, scopeNotes, leadId,
    } = body;

    const { rangeMin, rangeMax, lineItems, subtotal } = priceBreakdown as PriceBreakdown;
    const materialLabel = material === 'premium'
      ? 'Premium Asphalt (GAF Timberline UHDZ, 50-yr mfr warranty)'
      : 'Standard Asphalt (GAF Timberline HDZ, 30-yr mfr warranty)';
    const totalSqft = (sections as QuoteSection[]).reduce((s, sec) => s + sec.sqft, 0);
    const addOnsLabel = (addOns as string[]).join(', ') || 'None';

    // Generate PDF
    let pdfBase64: string | null = null;
    const safeName = (name as string).replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-');
    try {
      pdfBase64 = generateProposalPDF({
        name, email, phone, address,
        sections: sections as QuoteSection[],
        linearMeasurements: linearMeasurements as LinearMeasurements,
        addOns: addOns as string[],
        skylights: Number(skylights),
        chimneys: Number(chimneys),
        material,
        priceBreakdown: priceBreakdown as PriceBreakdown,
        scopeNotes,
        leadId,
      });
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr);
    }

    // Build line items HTML for emails
    const lineItemsHtml = (lineItems as LineItem[])
      .map(li => `<tr style="border-bottom:1px solid #f3f4f6"><td style="color:#6b7280;padding:8px 0">${li.label}</td><td style="font-weight:600;color:#111827;text-align:right">${fmtMoney(li.amount)}</td></tr>`)
      .join('');

    // Email 1 — Owner notification
    await resend.emails.send({
      from: 'leads@trustproofroofing.com',
      to: 'info@trustproofroofing.com',
      subject: `Quote Sent: ${name} — ${address}`,
      html: `
        <div style="font-family:sans-serif;max-width:540px;margin:0 auto">
          <div style="background:#1B3C6B;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
            <h2 style="margin:0;font-size:18px">Quote Sent to Homeowner</h2>
            <p style="margin:4px 0 0;opacity:0.7;font-size:13px">CRM Quote Builder — PDF attached</p>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:20px 24px;border-radius:0 0 12px 12px">
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="color:#6b7280;padding:6px 0;width:140px">Name</td><td style="font-weight:600">${name}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Address</td><td>${address}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Phone</td><td><a href="tel:${phone}" style="color:#1B3C6B">${phone}</a></td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Email</td><td><a href="mailto:${email}" style="color:#1B3C6B">${email}</a></td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Total Area</td><td>${totalSqft.toLocaleString()} sq ft (${(sections as QuoteSection[]).length} sections)</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Material</td><td>${materialLabel}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Add-ons</td><td>${addOnsLabel}</td></tr>
            </table>
            <div style="background:#1B3C6B;color:#fff;border-radius:8px;padding:14px 18px;margin-top:16px">
              <p style="margin:0;font-size:11px;opacity:0.7">Price Range Sent</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:700">${fmtMoney(rangeMin)} – ${fmtMoney(rangeMax)}</p>
            </div>
            ${scopeNotes ? `<div style="margin-top:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px"><p style="margin:0;font-size:12px;color:#6b7280;font-weight:600;margin-bottom:4px">Scope Notes</p><p style="margin:0;font-size:13px;color:#374151">${scopeNotes}</p></div>` : ''}
          </div>
        </div>`,
    });

    // Email 2 — Homeowner with PDF attachment
    const attachments = pdfBase64
      ? [{ filename: `TrustProof-Roofing-Proposal-${safeName}.pdf`, content: Buffer.from(pdfBase64, 'base64') }]
      : [];

    await resend.emails.send({
      from: 'Tenzin at Trust Proof Roofing <info@trustproofroofing.com>',
      to: email,
      subject: 'Your Roofing Proposal — Trust Proof Roofing',
      attachments,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#1B3C6B;color:#fff;padding:24px 28px;border-radius:12px 12px 0 0;text-align:center">
            <p style="margin:0;font-size:13px;opacity:0.7;letter-spacing:0.05em;text-transform:uppercase">Trust Proof Roofing</p>
            <h1 style="margin:6px 0 0;font-size:22px;font-weight:800">Your Personalized Roofing Proposal</h1>
          </div>

          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px 28px;border-radius:0 0 12px 12px">
            <p style="font-size:15px;color:#111827;margin-top:0">Hi ${name},</p>
            <p style="font-size:14px;color:#374151;line-height:1.6">I've reviewed your property at <strong>${address}</strong> and put together a detailed quote based on your roof's measurements and specifications.</p>
            ${pdfBase64 ? '<p style="font-size:14px;color:#374151;line-height:1.6">I\'ve attached a full <strong>proposal PDF</strong> for your records — it includes your quote details, a section-by-section breakdown, our 20-year warranty terms, and next steps.</p>' : ''}

            <div style="background:#1B3C6B;color:#fff;border-radius:10px;padding:20px 24px;margin:20px 0;text-align:center">
              <p style="margin:0;font-size:12px;opacity:0.7;text-transform:uppercase;letter-spacing:0.05em">Estimated Project Range</p>
              <p style="margin:8px 0 4px;font-size:32px;font-weight:800;line-height:1">${fmtMoney(rangeMin)} – ${fmtMoney(rangeMax)}</p>
              <p style="margin:0;font-size:12px;opacity:0.6">Exact price confirmed after free drone assessment</p>
            </div>

            <h3 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Price Breakdown</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:12px">
              ${lineItemsHtml}
              <tr style="background:#f9fafb"><td style="padding:9px 0;font-weight:700;color:#111827">Subtotal</td><td style="font-weight:700;color:#111827;text-align:right">${fmtMoney(subtotal)}</td></tr>
            </table>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:20px">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#15803d">Always included in your price:</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">✓ Full ice &amp; water shield</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">✓ Fascia &amp; drip edge</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">✓ Full cleanup &amp; magnetic nail sweep</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">✓ 20-year personal leak warranty</p>
            </div>

            <p style="font-size:14px;color:#374151;line-height:1.6">Every replacement I do comes with a <strong>20-year leak warranty</strong> — not a manufacturer program, my personal commitment in writing. I'd love to schedule a free drone assessment so you can see your roof in detail before we start anything.</p>

            <div style="text-align:center;margin:24px 0">
              <a href="https://trustproofroofing.com/contact" style="display:inline-block;background:#1B3C6B;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px">
                Schedule Free Drone Assessment →
              </a>
            </div>

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
