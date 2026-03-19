import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function fetchLogo(): string | null {
  try {
    return fs.readFileSync(path.join(process.cwd(), 'public', 'logo-navy.png')).toString('base64');
  } catch { return null; }
}

function fmtMoney(n: number) { return '$' + Math.round(n).toLocaleString(); }

const NAVY  = [27, 58, 107]  as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const DARK  = [25, 25, 25]   as [number, number, number];
const GRAY  = [120, 120, 120] as [number, number, number];
const LG    = [247, 248, 250] as [number, number, number];
const LM = 14; const RM = 14;
const HEADER_H = 38;
const LOGO_W = 22; const LOGO_H = 22;

function addHeader(doc: jsPDF, logo: string | null, title: string) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pw, HEADER_H, 'F');
  doc.setDrawColor(...NAVY); doc.setLineWidth(0.7);
  doc.line(0, HEADER_H, pw, HEADER_H);

  if (logo) {
    try { doc.addImage('data:image/png;base64,' + logo, 'PNG', LM, (HEADER_H - LOGO_H) / 2, LOGO_W, LOGO_H); }
    catch { /* skip */ }
  }

  const midX = pw / 2;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...NAVY);
  doc.text('TRUST PROOF ROOFING', midX, 14, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...NAVY);
  doc.text(title, midX, 22, { align: 'center' });
  doc.setFontSize(7);
  doc.text('CT HIC #HIC.0703927', pw - LM, 13, { align: 'right' });
  doc.text('(959) 333-8569',       pw - LM, 19, { align: 'right' });
  doc.text('info@trustproofroofing.com', pw - LM, 25, { align: 'right' });
}

function addFooter(doc: jsPDF, page: number) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const fy = ph - 10;
  doc.setDrawColor(...NAVY); doc.setLineWidth(0.3);
  doc.line(LM, fy - 4, pw - LM, fy - 4);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...GRAY);
  doc.text('Trust Proof Roofing LLC  ·  Suffield, CT  ·  (959) 333-8569  ·  trustproofroofing.com', pw / 2, fy, { align: 'center' });
  doc.text(`Page ${page}`, pw - LM, fy, { align: 'right' });
}

function sectionHead(doc: jsPDF, title: string, y: number): number {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...NAVY);
  doc.text(title, LM, y);
  doc.setDrawColor(180, 198, 226); doc.setLineWidth(0.3);
  doc.line(LM, y + 2, pw - LM, y + 2);
  return y + 8;
}

async function generateOrderPDF(order: any, lead: any, distributor: any): Promise<string> {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const SAFE = ph - 18;
  const logo = fetchLogo();
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const od = order.order_data || {};

  addHeader(doc, logo, 'MATERIAL ORDER');

  let y = HEADER_H + 12;

  // PO + Date
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...NAVY);
  doc.text(`PO: ${order.po_number}`, pw - LM, y, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
  doc.text(dateStr, pw - LM, y + 6, { align: 'right' });

  // FROM / TO blocks
  const colW = (pw - LM - RM - 8) / 2;
  const rightX = LM + colW + 8;

  doc.setFillColor(247, 248, 250);
  doc.setDrawColor(220, 225, 235); doc.setLineWidth(0.3);
  doc.roundedRect(LM, y, colW, 30, 2, 2, 'FD');
  doc.roundedRect(rightX, y, colW, 30, 2, 2, 'FD');

  let ly = y + 6;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...NAVY);
  doc.text('FROM', LM + 4, ly); ly += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  doc.text('Trust Proof Roofing LLC', LM + 4, ly); ly += 4.5;
  doc.setFontSize(8); doc.setTextColor(100, 100, 100);
  doc.text('Suffield, CT  ·  HIC.0703927', LM + 4, ly); ly += 4.5;
  doc.text('(959) 333-8569', LM + 4, ly); ly += 4.5;
  doc.text('info@trustproofroofing.com', LM + 4, ly);

  let ry = y + 6;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...NAVY);
  doc.text('TO', rightX + 4, ry); ry += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  doc.text(distributor?.name || '—', rightX + 4, ry); ry += 4.5;
  doc.setFontSize(8); doc.setTextColor(100, 100, 100);
  if (distributor?.contact_name) { doc.text(distributor.contact_name, rightX + 4, ry); ry += 4.5; }
  if (distributor?.email) { doc.text(distributor.email, rightX + 4, ry); ry += 4.5; }
  if (distributor?.account_number) { doc.text(`Account: ${distributor.account_number}`, rightX + 4, ry); }

  y += 36;

  // Job Details
  y = sectionHead(doc, 'JOB DETAILS', y);
  const jobDetails = [
    ['Job Address', lead?.address || '—'],
    ['Delivery Date', od.delivery?.deliveryDate || '—'],
    ['Time Window', od.delivery?.timeWindow || '—'],
    ['Site Contact', od.delivery?.onSite ? 'Yes — someone on site' : `No — ${od.delivery?.dropInstructions || 'see instructions'}`],
    ['Truck Restrictions', od.delivery?.truckRestrictions || 'None'],
  ];
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  jobDetails.forEach(([label, val]) => {
    if (y > SAFE - 10) { doc.addPage(); y = 20; addHeader(doc, logo, 'MATERIAL ORDER'); }
    doc.setTextColor(100, 100, 100); doc.text(label + ':', LM, y);
    doc.setTextColor(...DARK); doc.text(String(val), LM + 40, y);
    y += 5;
  });
  y += 4;

  // Material Order Table
  if (y > SAFE - 50) { doc.addPage(); y = 20; }
  y = sectionHead(doc, 'MATERIAL ORDER', y);

  const materials: any[] = od.materials || [];
  const tableRows = materials
    .filter((m: any) => Number(m.qty) > 0)
    .map((m: any) => [m.item, m.brand || '—', m.color || '—', m.unit, String(m.qty)]);

  if (tableRows.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: LM, right: RM },
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: LG },
      head: [['Item', 'Brand / Spec', 'Color / Style', 'Unit', 'Qty']],
      body: tableRows,
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        4: { halign: 'right', cellWidth: 18 },
      },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Delivery Instructions
  if (y > SAFE - 40) { doc.addPage(); y = 20; }
  y = sectionHead(doc, 'DELIVERY INSTRUCTIONS', y);
  const delivLines = [
    `Delivery Address: ${od.delivery?.deliveryAddress || lead?.address || '—'}`,
    od.delivery?.onSite === false && od.delivery?.dropInstructions
      ? `Drop Location: ${od.delivery.dropInstructions}` : null,
    od.delivery?.truckRestrictions ? `Truck Restrictions: ${od.delivery.truckRestrictions}` : null,
    od.delivery?.specialInstructions ? `Special Instructions: ${od.delivery.specialInstructions}` : null,
  ].filter(Boolean) as string[];

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  delivLines.forEach(line => {
    const ls = doc.splitTextToSize(line, pw - LM - RM);
    doc.text(ls, LM, y);
    y += ls.length * 4.8 + 1;
  });
  y += 4;

  // Order Terms
  if (y > SAFE - 30) { doc.addPage(); y = 20; }
  y = sectionHead(doc, 'ORDER TERMS', y);
  const terms = [
    `Back-order handling: ${od.backorderHandling === 'substitute' ? 'Substitute equivalent product' : 'Hold for original item'}`,
    `Substitution approval: ${od.substitutionApproval === 'required' ? 'Required — contact before substituting' : 'Not required'}`,
    `Delivery receipt required: ${od.deliveryReceiptRequired ? 'Yes' : 'No'}`,
  ];
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  terms.forEach(t => { doc.text(t, LM, y); y += 5.5; });
  y += 4;

  // Signature
  if (y > SAFE - 20) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
  doc.text(`Authorized by: Tenzin, Trust Proof Roofing LLC  ·  Date: ${dateStr}`, LM, y);

  // Footers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) { doc.setPage(i); addFooter(doc, i); }

  return Buffer.from(doc.output('arraybuffer')).toString('base64');
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = db();

  try {
    const body = await req.json();
    const { orderId } = body;

    const [orderRes, leadRes] = await Promise.all([
      supabase.from('material_orders').select('*').eq('id', orderId).single(),
      supabase.from('leads').select('*').eq('id', params.id).single(),
    ]);
    if (orderRes.error) throw new Error(orderRes.error.message);
    if (leadRes.error) throw new Error(leadRes.error.message);

    const order = orderRes.data;
    const lead = leadRes.data;

    let distributor = null;
    if (order.distributor_id) {
      const { data } = await supabase.from('distributors').select('*').eq('id', order.distributor_id).single();
      distributor = data;
    }

    const pdfBase64 = await generateOrderPDF(order, lead, distributor);
    const toEmail = distributor?.email || 'info@trustproofroofing.com';

    await resend.emails.send({
      from: 'Tenzin at Trust Proof Roofing <info@trustproofroofing.com>',
      to: toEmail,
      subject: `Material Order — ${lead?.address || 'Job'} — PO ${order.po_number}`,
      attachments: [{ filename: `MaterialOrder-${order.po_number}.pdf`, content: Buffer.from(pdfBase64, 'base64') }],
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#1B3A6B;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
            <p style="margin:0;font-size:12px;opacity:0.7;text-transform:uppercase">Trust Proof Roofing</p>
            <h2 style="margin:4px 0 0;font-size:18px">Material Order — PO ${order.po_number}</h2>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px">
            <p style="font-size:14px;color:#374151">Hi ${distributor?.contact_name || 'there'},</p>
            <p style="font-size:14px;color:#374151;line-height:1.6">
              Please find attached our material order for the above job.
              Contact Tenzin at (959) 333-8569 with any questions.
            </p>
            <p style="font-size:13px;color:#6b7280">Job Address: ${lead?.address || '—'}</p>
            <p style="font-size:13px;color:#6b7280">Account #: ${distributor?.account_number || '—'}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
            <p style="font-size:12px;color:#9ca3af">Trust Proof Roofing LLC · Suffield, CT · CT HIC #HIC.0703927</p>
          </div>
        </div>`,
    });

    await supabase
      .from('material_orders')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', orderId);

    return NextResponse.json({ success: true, distributorName: distributor?.name || toEmail });
  } catch (err: any) {
    console.error('Send material order error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
