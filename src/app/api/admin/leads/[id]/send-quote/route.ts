import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─── Helpers ────────────────────────────────────────── */
function fmtMoney(n: number) { return '$' + Math.round(n).toLocaleString(); }

function sanitizeAddress(addr: string): string {
  const stripped = addr
    .replace(/141\s+Quail\s+Run\s*(Road|Rd)?,?\s*/gi, '')
    .trim();
  if (!stripped || /^suffield,?\s*ct\s*(06078)?,?\s*(usa)?\.?$/i.test(stripped)) {
    return 'Suffield, CT';
  }
  return stripped;
}

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : phone;
}

async function fetchLogo(): Promise<string | null> {
  for (const path of ['/logo-navy.png', '/logo.png']) {
    try {
      const res = await fetch(`https://trustproofroofing.com${path}`);
      if (res.ok) return Buffer.from(await res.arrayBuffer()).toString('base64');
    } catch { /* try next */ }
  }
  return null;
}

/* ─── Types ──────────────────────────────────────────── */
interface QuoteSection {
  name: string; sqft: number; sqftWithWaste: number;
  pitch: number; workType: 'replace' | 'repair'; layers: 1 | 2;
}
interface LineItem { label: string; amount: number; }
interface PriceBreakdown { lineItems: LineItem[]; subtotal: number; rangeMin: number; rangeMax: number; }
interface PDFData {
  name: string; email: string; phone: string; address: string;
  sections: QuoteSection[];
  pitchCategory?: string;
  totalSqft?: number;
  addOns: string[]; skylights: number; chimneys: number;
  material: string; priceBreakdown: PriceBreakdown; scopeNotes?: string; leadId: string;
}

/* ─── PDF constants ──────────────────────────────────── */
const NAVY  = [27, 58, 107]   as [number, number, number]; // #1B3A6B
const WHITE = [255, 255, 255] as [number, number, number];
const GRAY  = [120, 120, 120] as [number, number, number];
const DARK  = [25, 25, 25]    as [number, number, number];
const LG    = [247, 248, 250] as [number, number, number];
const HEADER_H = 40;
const LOGO_H   = 20;
const LOGO_W   = 52;
const LM = 14; // left margin
const RM = 14; // right margin
const LH10 = 4.8; // line height for 10pt text (mm)
const LH9  = 4.3; // line height for 9pt text (mm)
const S    = 4;   // standard gap between sections (mm)

/* ─── PDF helpers ────────────────────────────────────── */
function addHeader(doc: jsPDF, logoBase64: string | null, subtitle: string) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pw, HEADER_H, 'F');

  if (logoBase64) {
    try {
      doc.addImage('data:image/png;base64,' + logoBase64, 'PNG', LM, (HEADER_H - LOGO_H) / 2, LOGO_W, LOGO_H);
    } catch { /* skip */ }
  }

  const midX = pw / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...WHITE);
  doc.text('TRUST PROOF ROOFING', midX, 15, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(185, 210, 245);
  doc.text(subtitle, midX, 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text('CT HIC #HIC.0703927',   pw - LM, 14, { align: 'right' });
  doc.text('(959) 333-8569',        pw - LM, 20, { align: 'right' });
  doc.text('trustproofroofing.com', pw - LM, 26, { align: 'right' });
}

function addFooter(doc: jsPDF, pageNum: number) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const fy = ph - 10;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.3);
  doc.line(LM, fy - 4, pw - LM, fy - 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(
    'Trust Proof Roofing LLC  \u00b7  Suffield, CT  \u00b7  (959) 333-8569  \u00b7  trustproofroofing.com  \u00b7  CT HIC #HIC.0703927',
    pw / 2, fy, { align: 'center' }
  );
  doc.text(`Page ${pageNum}`, pw - LM, fy, { align: 'right' });
}

function renderAllFooters(doc: jsPDF) {
  const n = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= n; i++) { doc.setPage(i); addFooter(doc, i); }
}

function addPreparedFor(doc: jsPDF, data: PDFData, proposalNum: string, dateStr: string): number {
  const pw = doc.internal.pageSize.getWidth();
  const displayAddress = sanitizeAddress(data.address);
  const fmtPhoneStr = formatPhone(data.phone);
  let y = HEADER_H + 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(data.name, LM, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  let ly = y + 6;
  doc.text(displayAddress, LM, ly); ly += LH9;
  doc.text(fmtPhoneStr,    LM, ly); ly += LH9;
  if (data.email) { doc.text(data.email, LM, ly); ly += LH9; }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(dateStr, pw - LM, y, { align: 'right' });
  doc.setTextColor(100, 100, 100);
  doc.text(`Proposal #: ${proposalNum}`, pw - LM, y + 6, { align: 'right' });

  const ruleY = Math.max(ly, y + 18) + 2;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.4);
  doc.line(LM, ruleY, pw - LM, ruleY);
  return ruleY + 4;
}

// Returns new y after the heading rule
function sectionHead(doc: jsPDF, title: string, y: number): number {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(title, LM, y);
  doc.setDrawColor(180, 198, 226);
  doc.setLineWidth(0.3);
  doc.line(LM, y + 2, pw - LM, y + 2);
  return y + 6;
}

function addAlwaysIncluded(doc: jsPDF, y: number): number {
  const pw = doc.internal.pageSize.getWidth();
  const col2x = pw / 2 + 4;
  const left  = ['Ice & water shield (full roof)', 'Drip edge installation', 'Underlayment', 'Magnetic nail sweep'];
  const right = ['Full photo documentation', 'Project updates throughout', '20-year leak warranty', 'Complete debris removal'];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  left.forEach( (item, i) => doc.text(`\u2022  ${item}`, LM + 2, y + i * LH10));
  right.forEach((item, i) => doc.text(`\u2022  ${item}`, col2x,  y + i * LH10));
  return y + Math.max(left.length, right.length) * LH10 + S;
}

function addInvestmentBox(doc: jsPDF, y: number, label: string, amount: number, footNote: string): number {
  const pw = doc.internal.pageSize.getWidth();
  const boxW = pw - LM - RM;
  const boxH = 28;
  doc.setFillColor(...NAVY);
  doc.roundedRect(LM, y, boxW, boxH, 3, 3, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 205, 240);
  doc.text(label.toUpperCase(), pw / 2, y + 9, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...WHITE);
  doc.text(fmtMoney(amount), pw / 2, y + 22, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(footNote, pw / 2, y + boxH + 4, { align: 'center' });
  return y + boxH + 7;
}

function addConditionalPricingNotice(doc: jsPDF, y: number): number {
  const AMBER_BG     = [255, 251, 235] as [number, number, number];
  const AMBER_BORDER = [217, 119,   6] as [number, number, number];
  const AMBER_TEXT   = [120,  53,  15] as [number, number, number];
  const pw = doc.internal.pageSize.getWidth();
  const nW = pw - LM - RM;
  const pad = 4;
  const innerW = nW - pad * 2;

  doc.setFontSize(10);
  const intro   = doc.splitTextToSize('Additional charges may apply if discovered during installation:', innerW);
  const bullets = [
    '\u2022  Rotted decking: $50.00/sheet (photo documentation before replacement)',
    '\u2022  Additional hidden layers: $75.00/square',
  ];
  const closing = doc.splitTextToSize('All additional work requires a signed Change Order — no extra work proceeds without your written approval.', innerW);
  const allLines = [...intro, ...bullets, ...closing];
  const titleH = 6;
  const bodyH  = allLines.length * LH10 + 2;
  const boxH   = titleH + bodyH + pad * 2;

  doc.setFillColor(...AMBER_BG);
  doc.setDrawColor(...AMBER_BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(LM, y, nW, boxH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...AMBER_TEXT);
  doc.text('CONDITIONAL PRICING NOTICE', LM + pad, y + pad + 4);
  let ny = y + pad + titleH;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  allLines.forEach(l => { doc.text(l, LM + pad, ny); ny += LH10; });
  return y + boxH + S;
}

function addWarranty(doc: jsPDF, y: number): number {
  const pw = doc.internal.pageSize.getWidth();
  const text = 'Trust Proof Roofing warrants all roof replacement workmanship against leaks for 20 years from date of completion. If your roof leaks due to a workmanship defect, we will repair it at no charge — this warranty is transferable to new owners with written notice.';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  const ls = doc.splitTextToSize(text, pw - LM - RM);
  doc.text(ls, LM, y);
  return y + ls.length * LH10 + S;
}

function addSignatureBlock(doc: jsPDF, y: number, introText: string): number {
  const pw = doc.internal.pageSize.getWidth();
  const nW = pw - LM - RM;
  const pad = 4;
  const innerW = nW - pad * 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const introLines = doc.splitTextToSize(introText, innerW);
  const introH = introLines.length * LH9 + pad * 2 + 2;
  doc.setFillColor(248, 249, 251);
  doc.setDrawColor(200, 205, 215);
  doc.setLineWidth(0.3);
  doc.roundedRect(LM, y, nW, introH, 2, 2, 'FD');
  doc.text(introLines, LM + pad, y + pad + 3);
  y += introH + S;

  const colW = (nW - 5) / 2;
  const rightX = LM + colW + 5;
  const sigBoxH = 32;

  // Left: Homeowner
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(200, 205, 215);
  doc.setLineWidth(0.3);
  doc.roundedRect(LM, y, colW, sigBoxH, 2, 2, 'FD');
  let ly = y + 6;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...NAVY);
  doc.text('HOMEOWNER', LM + 4, ly); ly += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
  doc.text('Signature: _________________________', LM + 4, ly); ly += 6.5;
  doc.text('Printed Name: ______________________', LM + 4, ly); ly += 6.5;
  doc.text('Date: _____________________________', LM + 4, ly);

  // Right: Contractor
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(200, 205, 215);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightX, y, colW, sigBoxH, 2, 2, 'FD');
  let ry = y + 6;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...NAVY);
  doc.text('CONTRACTOR', rightX + 4, ry); ry += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
  doc.text('Tenzin \u2014 Trust Proof Roofing LLC', rightX + 4, ry); ry += 6.5;
  doc.text('Signature: _________________________', rightX + 4, ry); ry += 6.5;
  doc.text('Date: _____________________________', rightX + 4, ry);

  return y + sigBoxH + S;
}

function pitchStr(pitch: number): string {
  if (pitch < 18) return `Low (${pitch}\u00b0)`;
  if (pitch < 30) return `Moderate (${pitch}\u00b0)`;
  if (pitch < 40) return `Steep (${pitch}\u00b0)`;
  return `Very Steep (${pitch}\u00b0)`;
}

function pitchCategoryLabel(cat?: string): string {
  const map: Record<string, string> = { low: 'Low', moderate: 'Moderate', steep: 'Steep', very_steep: 'Very Steep' };
  return cat ? (map[cat] ?? cat) : 'Moderate';
}

/* ─── PRE-INSPECTION PDF ─────────────────────────────── */
async function generatePreInspectionPDF(data: PDFData): Promise<string> {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const SAFE_BOTTOM = ph - 18;
  const logoBase64 = await fetchLogo();
  const proposalNum = `TPR-${data.leadId.slice(-6).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const { subtotal } = data.priceBreakdown;

  if (!data.sections?.length || data.sections.every(s => !s.sqft || s.sqft === 0)) {
    data = { ...data, sections: [{ name: 'Roof Replacement', sqft: data.totalSqft || 0, sqftWithWaste: Math.round((data.totalSqft || 0) * 1.1), pitch: 22, workType: 'replace', layers: 1 }] };
  }
  const filtered = (data.sections || []).filter(s => s.sqft > 0);
  const scopeRows = filtered.length > 0
    ? filtered.map(s => [s.name, s.workType === 'replace' ? 'Replace' : 'Repair', pitchStr(s.pitch), `${s.sqft.toLocaleString()} sq ft`])
    : [['Roof Replacement', 'Replace', pitchCategoryLabel(data.pitchCategory), `${(data.totalSqft || 0).toLocaleString()} sq ft`]];

  /* ── PAGE 1: header → investment box ── */
  addHeader(doc, logoBase64, 'PRELIMINARY ESTIMATE');
  let y = addPreparedFor(doc, data, proposalNum, dateStr);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const introLines = doc.splitTextToSize('This preliminary estimate is based on an initial assessment. A free on-site inspection will confirm exact measurements and finalize pricing.', pw - LM - RM);
  doc.text(introLines, LM, y);
  y += introLines.length * LH10 + S;

  y = sectionHead(doc, 'SCOPE SUMMARY', y);
  autoTable(doc, {
    startY: y,
    margin: { left: LM, right: LM },
    styles: { fontSize: 10, cellPadding: 2.5 },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10 },
    alternateRowStyles: { fillColor: LG },
    head: [['Section', 'Work Type', 'Pitch', 'Est. Area']],
    body: scopeRows,
    columnStyles: { 0: { fontStyle: 'bold' }, 3: { halign: 'right' } },
  });
  y = (doc as any).lastAutoTable.finalY + S;

  y = sectionHead(doc, 'ALWAYS INCLUDED', y);
  y = addAlwaysIncluded(doc, y);

  y = addInvestmentBox(doc, y, 'Preliminary Estimate', subtotal, 'Final pricing confirmed after on-site inspection and exact measurements.');

  /* ── PAGE 2: conditional notice + warranty + next steps + signature ── */
  doc.addPage();
  y = 14;

  y = addConditionalPricingNotice(doc, y);

  y = sectionHead(doc, 'OUR 20-YEAR LEAK WARRANTY', y);
  y = addWarranty(doc, y);

  y = sectionHead(doc, 'NEXT STEPS', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  [
    'Schedule your free on-site inspection — call or text (959) 333-8569',
    'Receive a final binding proposal with exact measurements and pricing',
    'Sign the Roofing Agreement and submit your deposit',
    'Installation with daily photo updates throughout the project',
    'Final walkthrough and warranty documentation delivered at completion',
  ].forEach((step, i) => {
    const ls = doc.splitTextToSize(`${i + 1}.  ${step}`, pw - LM - RM - 4);
    doc.text(ls, LM + 2, y);
    y += ls.length * LH10 + 1;
  });
  y += S;

  if (y > SAFE_BOTTOM - 50) { doc.addPage(); y = 14; }
  y = sectionHead(doc, 'ACKNOWLEDGMENT', y);
  y = addSignatureBlock(doc, y,
    'By signing below, the homeowner acknowledges receipt of this preliminary estimate and authorizes Trust Proof Roofing LLC to conduct a free on-site inspection. This estimate is valid for 30 days and is not a binding contract.'
  );

  renderAllFooters(doc);
  return Buffer.from(doc.output('arraybuffer')).toString('base64');
}

/* ─── POST-INSPECTION PDF ────────────────────────────── */
async function generatePostInspectionPDF(data: PDFData): Promise<string> {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const SAFE_BOTTOM = ph - 18;
  const logoBase64 = await fetchLogo();
  const proposalNum = `TPR-${data.leadId.slice(-6).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const { lineItems, subtotal } = data.priceBreakdown;

  if (!data.sections?.length || data.sections.every(s => !s.sqft || s.sqft === 0)) {
    data = { ...data, sections: [{ name: 'Roof Replacement', sqft: data.totalSqft || 0, sqftWithWaste: Math.round((data.totalSqft || 0) * 1.1), pitch: 22, workType: 'replace', layers: 1 }] };
  }
  const filtered = (data.sections || []).filter(s => s.sqft > 0);
  const sectionRows = filtered.length > 0
    ? filtered.map(s => [
        s.name,
        s.workType === 'replace' ? 'Replace' : 'Repair',
        pitchStr(s.pitch),
        s.workType === 'replace' ? String(s.layers) : 'N/A',
        `${s.sqft.toLocaleString()} sq ft`,
      ])
    : [['Roof Replacement', 'Replace', pitchCategoryLabel(data.pitchCategory), '1', `${(data.totalSqft || 0).toLocaleString()} sq ft`]];

  /* ── PAGE 1: header → investment box ── */
  addHeader(doc, logoBase64, 'ROOFING PROPOSAL');
  let y = addPreparedFor(doc, data, proposalNum, dateStr);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const introLines = doc.splitTextToSize('This proposal reflects the scope and pricing agreed upon following assessment of your property.', pw - LM - RM);
  doc.text(introLines, LM, y);
  y += introLines.length * LH10 + S;

  y = sectionHead(doc, 'ROOF SCOPE', y);
  autoTable(doc, {
    startY: y,
    margin: { left: LM, right: LM },
    styles: { fontSize: 10, cellPadding: 2.5 },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10 },
    alternateRowStyles: { fillColor: LG },
    head: [['Section', 'Work Type', 'Pitch', 'Layers', 'Sq Ft']],
    body: sectionRows,
    columnStyles: { 0: { fontStyle: 'bold' }, 4: { halign: 'right' } },
  });
  y = (doc as any).lastAutoTable.finalY + S;

  y = sectionHead(doc, 'ALWAYS INCLUDED', y);
  y = addAlwaysIncluded(doc, y);

  y = sectionHead(doc, 'PRICE BREAKDOWN', y);
  const priceRows: [string, string][] = lineItems.map(li => {
    const amt = li.label.toLowerCase().includes('repair estimate')
      ? '$350\u2013$2,500'
      : li.amount === 0 ? 'Included' : fmtMoney(li.amount);
    return [li.label, amt];
  });
  autoTable(doc, {
    startY: y,
    margin: { left: LM, right: LM },
    styles: { fontSize: 10, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: LG },
    columnStyles: {
      0: { textColor: [55, 65, 81] as [number, number, number] },
      1: { textColor: DARK, halign: 'right', fontStyle: 'bold' },
    },
    foot: [['Total', fmtMoney(subtotal)]],
    footStyles: { fillColor: [230, 235, 245] as [number, number, number], textColor: NAVY, fontStyle: 'bold', fontSize: 10 },
    body: priceRows,
    showHead: false,
  });
  y = (doc as any).lastAutoTable.finalY + S;

  y = addInvestmentBox(doc, y, 'Project Investment', subtotal, 'Price valid for 30 days from date of proposal.');

  /* ── PAGE 2: conditional notice + warranty + next steps + signature ── */
  doc.addPage();
  y = 14;

  y = addConditionalPricingNotice(doc, y);

  y = sectionHead(doc, 'OUR 20-YEAR LEAK WARRANTY', y);
  y = addWarranty(doc, y);

  y = sectionHead(doc, 'NEXT STEPS', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  [
    'Review this proposal and contact Tenzin with any questions: (959) 333-8569',
    `Sign the Roofing Agreement and submit your deposit of ${fmtMoney(Math.round(subtotal / 3))} (1/3 of project total)`,
    'Receive your installation date — daily photo updates throughout the project',
    'Final walkthrough, punch list, and warranty documentation at completion',
  ].forEach((step, i) => {
    const ls = doc.splitTextToSize(`${i + 1}.  ${step}`, pw - LM - RM - 4);
    doc.text(ls, LM + 2, y);
    y += ls.length * LH10 + 1;
  });
  y += S;

  if (y > SAFE_BOTTOM - 50) { doc.addPage(); y = 14; }
  y = sectionHead(doc, 'PROPOSAL ACCEPTANCE', y);
  y = addSignatureBlock(doc, y,
    'By signing below, the homeowner accepts this proposal and authorizes Trust Proof Roofing LLC to proceed upon execution of the full Roofing Agreement, which includes Connecticut Home Improvement Act disclosures, 3-day cancellation rights, and full warranty terms. This proposal is valid for 30 days from date of issue.'
  );

  renderAllFooters(doc);
  return Buffer.from(doc.output('arraybuffer')).toString('base64');
}

/* ─── Route handler ───────────────────────────────────── */
export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await req.json();
    const {
      name, email, phone, address,
      sections, pitchCategory, addOns, skylights, chimneys,
      material, priceBreakdown, scopeNotes, leadId, proposalType, totalSqft: passedSqft,
    } = body;

    const isPre = proposalType === 'pre';
    const firstName = (name as string).split(' ')[0];
    const displayAddress = sanitizeAddress(address as string);
    const { lineItems, subtotal } = priceBreakdown as PriceBreakdown;

    const sectionsArr = (sections as QuoteSection[]) || [];
    const totalSqft = (passedSqft as number) || sectionsArr.reduce((s: number, r: QuoteSection) => s + (r.sqft || 0), 0);

    const pdfData: PDFData = {
      name, email, phone, address,
      sections: sectionsArr,
      pitchCategory: pitchCategory as string | undefined,
      totalSqft,
      addOns: addOns as string[],
      skylights: Number(skylights), chimneys: Number(chimneys),
      material, priceBreakdown: priceBreakdown as PriceBreakdown,
      scopeNotes, leadId,
    };

    const safeFirst = firstName.replace(/[^a-zA-Z0-9]/g, '');
    const pdfFilename = isPre
      ? `TrustProof-Preliminary-Estimate-${safeFirst}.pdf`
      : `TrustProof-Roofing-Proposal-${safeFirst}.pdf`;

    let pdfBase64: string | null = null;
    try {
      pdfBase64 = isPre
        ? await generatePreInspectionPDF(pdfData)
        : await generatePostInspectionPDF(pdfData);
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr);
    }

    // Email — homeowner
    const subject = isPre
      ? 'Your Preliminary Roofing Estimate — Trust Proof Roofing'
      : 'Your Roofing Proposal — Trust Proof Roofing';

    const lineItemsHtml = (lineItems as LineItem[])
      .map(li => {
        const amt = li.label.toLowerCase().includes('repair estimate') ? '$350–$2,500' : fmtMoney(li.amount);
        return `<tr style="border-bottom:1px solid #f3f4f6"><td style="color:#6b7280;padding:8px 0">${li.label}</td><td style="font-weight:600;color:#111827;text-align:right">${amt}</td></tr>`;
      })
      .join('');

    const attachments = pdfBase64
      ? [{ filename: pdfFilename, content: Buffer.from(pdfBase64, 'base64') }]
      : [];

    await resend.emails.send({
      from: 'Tenzin at Trust Proof Roofing <info@trustproofroofing.com>',
      to: email,
      subject,
      attachments,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#1B3C6B;color:#fff;padding:24px 28px;border-radius:12px 12px 0 0;text-align:center">
            <p style="margin:0;font-size:13px;opacity:0.7;letter-spacing:0.05em;text-transform:uppercase">Trust Proof Roofing</p>
            <h1 style="margin:6px 0 0;font-size:22px;font-weight:800">${isPre ? 'Your Preliminary Estimate' : 'Your Roofing Proposal'}</h1>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:24px 28px;border-radius:0 0 12px 12px">
            <p style="font-size:15px;color:#111827;margin-top:0">Hi ${firstName},</p>
            ${isPre
              ? `<p style="font-size:14px;color:#374151;line-height:1.6">Thank you for reaching out. I've attached a preliminary estimate for your property based on our initial assessment. This gives you a solid price range to work with. I'd love to schedule a free on-site inspection to confirm exact measurements and provide final pricing.</p>
                 <p style="font-size:14px;color:#374151;line-height:1.6">Call or text me directly at (959) 333-8569.</p>`
              : `<p style="font-size:14px;color:#374151;line-height:1.6">Please find your roofing proposal attached. All pricing is based on our on-site inspection. To move forward, simply sign the Roofing Agreement and submit your deposit.</p>
                 <p style="font-size:14px;color:#374151;line-height:1.6">I'm available at (959) 333-8569 for any questions.</p>`
            }
            <div style="background:#1B3C6B;color:#fff;border-radius:10px;padding:20px 24px;margin:20px 0;text-align:center">
              <p style="margin:0;font-size:12px;opacity:0.7;text-transform:uppercase;letter-spacing:0.05em">${isPre ? 'Preliminary Estimate' : 'Project Investment'}</p>
              <p style="margin:8px 0 4px;font-size:32px;font-weight:800;line-height:1">${fmtMoney(subtotal)}</p>
              <p style="margin:6px 0 0;font-size:11px;opacity:0.8">${isPre ? 'Final pricing confirmed after on-site inspection.' : 'Price valid for 30 days from date of proposal.'}</p>
            </div>
            ${!isPre ? `
            <h3 style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Price Breakdown</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:12px">
              ${lineItemsHtml}
              <tr style="background:#f9fafb"><td style="padding:9px 0;font-weight:700;color:#111827">Subtotal</td><td style="font-weight:700;color:#111827;text-align:right">${fmtMoney(subtotal)}</td></tr>
            </table>` : ''}
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:20px">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#15803d">Always included in your price:</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">&#x2713; Ice &amp; water shield (full roof)</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">&#x2713; Drip edge installation</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">&#x2713; Underlayment</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">&#x2713; Magnetic nail sweep</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">&#x2713; Full photo documentation</p>
              <p style="margin:3px 0;font-size:13px;color:#166534">&#x2713; 20-year workmanship leak warranty</p>
            </div>
            <p style="font-size:14px;color:#374151;line-height:1.8;margin-top:20px">
              — Tenzin<br>
              <strong>Trust Proof Roofing</strong><br>
              <a href="tel:9593338569" style="color:#1B3C6B;text-decoration:none">(959) 333-8569</a><br>
              <a href="https://trustproofroofing.com" style="color:#1B3C6B;text-decoration:none">trustproofroofing.com</a><br>
              CT HIC #HIC.0703927
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="font-size:11px;color:#9ca3af;text-align:center">Trust Proof Roofing LLC · Suffield, CT 06078 · CT HIC #HIC.0703927</p>
          </div>
        </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Send quote error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
