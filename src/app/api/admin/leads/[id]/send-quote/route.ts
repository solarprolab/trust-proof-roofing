import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─── Helpers ─────────────────────────────────────────── */
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
  try {
    const res = await fetch('https://trustproofroofing.com/logo.png');
    if (res.ok) return Buffer.from(await res.arrayBuffer()).toString('base64');
  } catch { /* fall through */ }
  return null;
}

/* ─── Types ───────────────────────────────────────────── */
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

/* ─── Shared PDF constants ────────────────────────────── */
const NAVY  = [27, 60, 107]   as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const GRAY  = [100, 100, 100] as [number, number, number];
const DARK  = [30, 30, 30]    as [number, number, number];
const LG    = [248, 249, 250] as [number, number, number];
const HEADER_H = 40;
// Logo: 2.5:1 aspect ratio, 22mm tall
const LOGO_H = 22;
const LOGO_W = LOGO_H * 2.5; // 55mm

/* ─── Shared PDF helpers ──────────────────────────────── */
function addSharedHeader(doc: jsPDF, logoBase64: string | null, subtitle: string) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pw, HEADER_H, 'F');
  if (logoBase64) {
    try {
      doc.addImage('data:image/png;base64,' + logoBase64, 'PNG', 14, (HEADER_H - LOGO_H) / 2, LOGO_W, LOGO_H);
    } catch { /* skip */ }
  }
  const textX = 14 + LOGO_W + 5;
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('TRUST PROOF ROOFING', textX, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(subtitle, textX, 27);
  doc.setFontSize(8);
  doc.text('CT HIC #HIC.0703927',   pw - 12, 14, { align: 'right' });
  doc.text('(959) 333-8569',        pw - 12, 21, { align: 'right' });
  doc.text('trustproofroofing.com', pw - 12, 28, { align: 'right' });
}

function addSharedFooter(doc: jsPDF, pageNum: number) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
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

function renderAllFooters(doc: jsPDF) {
  const n = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    addSharedFooter(doc, i);
  }
}

function addPreparedForBlock(doc: jsPDF, data: PDFData, proposalNum: string, dateStr: string): number {
  const pw = doc.internal.pageSize.getWidth();
  const displayAddress = sanitizeAddress(data.address);
  const fmtPhoneStr = formatPhone(data.phone);
  let y = HEADER_H + 12;

  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Prepared for: ${data.name}`, 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  y += 6; doc.text(displayAddress, 14, y);
  y += 5; doc.text(fmtPhoneStr, 14, y);
  if (data.email) { y += 5; doc.text(data.email, 14, y); }

  doc.setTextColor(80, 80, 80);
  doc.text(`Date: ${dateStr}`,          pw - 14, HEADER_H + 12, { align: 'right' });
  doc.text(`Proposal #: ${proposalNum}`, pw - 14, HEADER_H + 18, { align: 'right' });

  y += 8;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.5);
  doc.line(14, y, pw - 14, y);
  return y + 8;
}

function addWhatIsIncluded(doc: jsPDF, y: number): number {
  const pw = doc.internal.pageSize.getWidth();
  const leftItems  = ['Ice & water shield (full roof)', 'Drip edge installation', 'Underlayment', 'Magnetic nail sweep'];
  const rightItems = ['Full photo documentation', 'Project updates', '20-year leak warranty', 'Complete debris removal'];
  const col2x = pw / 2 + 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  leftItems.forEach( (item, i) => doc.text(`\u2022 ${item}`, 16, y + i * 6));
  rightItems.forEach((item, i) => doc.text(`\u2022 ${item}`, col2x, y + i * 6));
  return y + Math.max(leftItems.length, rightItems.length) * 6 + 10;
}

// Section heading with 5px navy divider bar
function addSectionBar(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...NAVY);
  doc.rect(14, y, 182, 5, 'F');
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(title, 14, y);
  return y + 8;
}

function addConditionalPricingNotice(doc: jsPDF, y: number, isPost: boolean): number {
  const ph = doc.internal.pageSize.getHeight();
  const AMBER_BG     = [255, 251, 235] as [number, number, number];
  const AMBER_BORDER = [245, 158, 11]  as [number, number, number];
  const nW = 182;
  const pad = 5;
  const innerW = nW - pad * 2;

  const title = isPost ? 'CONDITIONAL PRICING NOTICE' : 'FACTORS THAT MAY AFFECT FINAL PRICING';
  const bodyLines = isPost ? [
    'The following conditions, if discovered during installation, will result in additional charges requiring written homeowner approval before work proceeds:',
    '\u2022 Rotted or damaged roof decking: $50.00 per sheet (photo documentation provided before any replacement)',
    '\u2022 Additional roofing layers beyond those visible at inspection: $75.00 per square (100 sq ft)',
    'All additional work requires a signed Change Order. No extra work proceeds without homeowner authorization.',
  ] : [
    'The following conditions, if discovered during inspection or installation, may result in price adjustments:',
    '\u2022 Rotted or damaged roof decking: $50.00 per sheet',
    '\u2022 Additional roofing layers beyond what is currently visible: $75.00 per square (100 sq ft)',
    'All changes require written homeowner approval before work proceeds.',
  ];

  doc.setFontSize(9);
  const splits = bodyLines.map(l => doc.splitTextToSize(l, innerW));
  const titleH = 8;
  const bodyH  = splits.reduce((acc, ls) => acc + ls.length * 4.5 + 3, 0);
  const boxH   = titleH + bodyH + pad * 2;

  // Page break if not enough room
  if (y + boxH > ph - 25) {
    doc.addPage();
    y = 18;
  }

  doc.setFillColor(...AMBER_BG);
  doc.setDrawColor(...AMBER_BORDER);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, nW, boxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14);
  doc.text(title, 14 + pad, y + pad + 5);

  let ny = y + pad + titleH + 1;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  splits.forEach(ls => { doc.text(ls, 14 + pad, ny); ny += ls.length * 4.5 + 3; });
  return y + boxH + 8;
}

function addWhyTrustProof(doc: jsPDF, y: number): number {
  const pw = doc.internal.pageSize.getWidth();
  const reasons = [
    { title: 'Transparency', body: 'We walk through every detail of your roof with you before work begins. You see what we see — every issue documented in writing. No surprises.' },
    { title: 'Documentation', body: 'Written proposals before we start. Photos throughout the project. Written warranty at completion. No verbal agreements, ever.' },
    { title: 'Quality', body: 'Manufacturer-specification installation on every job. Licensed and insured in Connecticut. CT HIC #HIC.0703927.' },
  ];
  reasons.forEach(r => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(r.title, 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    const ls = doc.splitTextToSize(r.body, pw - 28);
    doc.text(ls, 14, y);
    y += ls.length * 5 + 7;
  });
  return y + 4;
}

function addWarranty(doc: jsPDF, y: number): number {
  const pw = doc.internal.pageSize.getWidth();
  const text = 'Trust Proof Roofing warrants all roof replacement workmanship against leaks for 20 years from the date of completion. If your roof leaks due to a workmanship defect within the warranty period, we will repair it at no additional cost. This warranty is transferable to new owners with written notice.';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const ls = doc.splitTextToSize(text, pw - 28);
  doc.text(ls, 14, y);
  return y + ls.length * 5 + 10;
}

function addInvestmentBox(doc: jsPDF, y: number, label: string, rangeMin: number, rangeMax: number, footNote: string): number {
  const pw = doc.internal.pageSize.getWidth();
  const boxH = 34;
  doc.setFillColor(...NAVY);
  doc.setDrawColor(150, 175, 220);
  doc.setLineWidth(0.6);
  doc.roundedRect(14, y, pw - 28, boxH, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 215, 240);
  doc.text(label, pw / 2, y + 10, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...WHITE);
  doc.text(`${fmtMoney(rangeMin)} \u2013 ${fmtMoney(rangeMax)}`, pw / 2, y + 25, { align: 'center' });
  y += boxH + 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(footNote, pw / 2, y, { align: 'center' });
  return y + 10;
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
  const logoBase64 = await fetchLogo();
  const proposalNum = `TPR-${data.leadId.slice(-6).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const { rangeMin, rangeMax } = data.priceBreakdown;

  // Section rows — always show at least one row
  const filtered = (data.sections || []).filter(s => s.sqft > 0);
  const scopeRows = filtered.length > 0
    ? filtered.map(s => [s.name, s.workType === 'replace' ? 'Replace' : 'Repair', pitchStr(s.pitch), `~${s.sqft.toLocaleString()} sq ft`])
    : [['Roof Replacement', 'Replace', pitchCategoryLabel(data.pitchCategory), `~${(data.totalSqft || 0).toLocaleString()} sq ft`]];

  /* PAGE 1 */
  addSharedHeader(doc, logoBase64, 'ROOFING PROPOSAL \u2014 PRELIMINARY ESTIMATE');
  let y = addPreparedForBlock(doc, data, proposalNum, dateStr);

  // Intro
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const introText = 'Thank you for the opportunity to provide a roofing estimate for your property. This preliminary proposal is based on an initial assessment and provides an estimated price range for your project. A detailed inspection will allow us to confirm exact measurements and finalize pricing.';
  const introLines = doc.splitTextToSize(introText, pw - 28);
  doc.text(introLines, 14, y);
  y += introLines.length * 5 + 10;

  // Scope summary table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('SCOPE SUMMARY', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: LG },
    head: [['Section', 'Work Type', 'Pitch', 'Est. Area']],
    body: scopeRows,
    columnStyles: { 0: { fontStyle: 'bold' } },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // What is always included (after scope table, before investment box)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('WHAT IS ALWAYS INCLUDED', 14, y);
  y += 6;
  y = addWhatIsIncluded(doc, y);

  // Investment box
  y = addInvestmentBox(doc, y, 'Preliminary Estimate Range', rangeMin, rangeMax,
    'Final pricing confirmed after on-site inspection and exact measurements.');

  // Schedule inspection box (blue)
  const BLUE_BG     = [239, 246, 255] as [number, number, number];
  const BLUE_BORDER = [59, 130, 246]  as [number, number, number];
  const bW = 182; const bPad = 5; const bInnerW = bW - bPad * 2;
  const bTitle = 'NEXT STEP: SCHEDULE YOUR FREE INSPECTION';
  const bBody = 'This estimate is based on preliminary information. We recommend a free on-site inspection to confirm exact measurements, identify any hidden conditions, and provide you with a final binding proposal. Our inspection is thorough, no-obligation, and typically completed within 1-2 hours.\n\nTo schedule: call (959) 333-8569 or visit trustproofroofing.com/contact';
  doc.setFontSize(9);
  const bLines = doc.splitTextToSize(bBody, bInnerW);
  const bTitleH = 8; const bBodyH = bLines.length * 4.5 + 3; const bH = bTitleH + bBodyH + bPad * 2;
  if (y + bH > ph - 25) { doc.addPage(); y = 18; }
  doc.setFillColor(...BLUE_BG); doc.setDrawColor(...BLUE_BORDER); doc.setLineWidth(0.5);
  doc.roundedRect(14, y, bW, bH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...BLUE_BORDER);
  doc.text(bTitle, 14 + bPad, y + bPad + 5);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  doc.text(bLines, 14 + bPad, y + bPad + bTitleH + 1);
  y += bH + 10;

  // Conditional pricing notice
  y = addConditionalPricingNotice(doc, y, false);

  /* PAGE 2 */
  doc.addPage();
  y = 18;

  // 1. OUR 20-YEAR LEAK WARRANTY
  y = addSectionBar(doc, 'OUR 20-YEAR LEAK WARRANTY', y);
  y = addWarranty(doc, y);

  // 2. NEXT STEPS
  y = addSectionBar(doc, 'NEXT STEPS', y);
  const preSteps = [
    'Schedule your free on-site inspection',
    'Receive your final binding proposal with exact pricing',
    'Review, sign contract, and submit deposit',
    'Installation with real-time photo updates',
    'Final walkthrough and warranty documentation',
  ];
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  preSteps.forEach((step, i) => { doc.text(`${i + 1}.  ${step}`, 18, y); y += 7; });
  y += 6;

  // 3. WHY TRUST PROOF ROOFING
  y = addSectionBar(doc, 'WHY TRUST PROOF ROOFING', y);
  y = addWhyTrustProof(doc, y);

  // 4. PRELIMINARY ESTIMATE ACKNOWLEDGMENT
  y = addSectionBar(doc, 'PRELIMINARY ESTIMATE ACKNOWLEDGMENT', y);
  const aW = 182; const aPad = 5; const aInnerW = aW - aPad * 2;

  const preAcceptParas = [
    'By signing below, the homeowner acknowledges receipt of this preliminary estimate and authorizes Trust Proof Roofing LLC to conduct a free on-site inspection to finalize measurements and pricing.',
    "This preliminary estimate is valid for 30 days. Final binding pricing is subject to on-site inspection and execution of Trust Proof Roofing LLC\u2019s standard Roofing Agreement.",
  ];
  const preAcceptSplits = preAcceptParas.map(p => doc.splitTextToSize(p, aInnerW));
  doc.setFontSize(9);
  const aBodyH = preAcceptSplits.reduce((a, ls) => a + ls.length * 4.5 + 4, 0) + 40;
  const aH = aBodyH + aPad * 2;

  if (y + aH > ph - 25) { doc.addPage(); y = 18; }
  doc.setFillColor(249, 250, 251); doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.4);
  doc.roundedRect(14, y, aW, aH, 2, 2, 'FD');

  let ay = y + aPad + 3;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  preAcceptSplits.forEach(ls => { doc.text(ls, 14 + aPad, ay); ay += ls.length * 4.5 + 5; });
  ay += 4;
  doc.text('Homeowner Signature: _________________________  Date: ___________', 14 + aPad, ay); ay += 7;
  doc.text('Printed Name: _________________________', 14 + aPad, ay); ay += 10;
  doc.text('Contractor Signature: _________________________  Date: ___________', 14 + aPad, ay); ay += 6;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...NAVY);
  doc.text('Tenzin \u2014 Trust Proof Roofing LLC', 14 + aPad, ay);

  renderAllFooters(doc);
  return Buffer.from(doc.output('arraybuffer')).toString('base64');
}

/* ─── POST-INSPECTION PDF ────────────────────────────── */
async function generatePostInspectionPDF(data: PDFData): Promise<string> {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const logoBase64 = await fetchLogo();
  const proposalNum = `TPR-${data.leadId.slice(-6).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const { rangeMin, rangeMax, lineItems, subtotal } = data.priceBreakdown;

  // Section rows — always show at least one row
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

  /* PAGE 1 */
  addSharedHeader(doc, logoBase64, 'ROOFING PROPOSAL');
  let y = addPreparedForBlock(doc, data, proposalNum, dateStr);

  // Intro
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const introText = 'This proposal has been prepared following a thorough on-site inspection of your property. All measurements and pricing are based on direct assessment of your roof and reflect final project pricing.';
  const introLines = doc.splitTextToSize(introText, pw - 28);
  doc.text(introLines, 14, y);
  y += introLines.length * 5 + 10;

  // Section breakdown table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('ROOF SECTION BREAKDOWN', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: LG },
    head: [['Section', 'Work Type', 'Pitch', 'Layers', 'Sq Ft']],
    body: sectionRows,
    columnStyles: { 0: { fontStyle: 'bold' } },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // What is always included (after section table, before price breakdown)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('WHAT IS ALWAYS INCLUDED', 14, y);
  y += 6;
  y = addWhatIsIncluded(doc, y);

  // Price breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text('PRICE BREAKDOWN', 14, y);
  y += 4;

  const priceRows: [string, string][] = lineItems.map(li => {
    const label = li.label;
    const amt   = li.label.toLowerCase().includes('repair estimate') ? '$350\u2013$2,500' : fmtMoney(li.amount);
    return [label, amt];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { textColor: [60, 60, 60] as [number, number, number] },
      1: { textColor: DARK, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: LG },
    foot: [['Subtotal', fmtMoney(subtotal)]],
    footStyles: { fillColor: [240, 240, 240] as [number, number, number], textColor: DARK, fontStyle: 'bold', fontSize: 9 },
    body: priceRows,
    showHead: false,
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Investment box
  y = addInvestmentBox(doc, y, 'Project Investment', rangeMin, rangeMax,
    'Price valid for 30 days from date of proposal.');

  // Conditional pricing notice (with auto page break)
  y = addConditionalPricingNotice(doc, y, true);

  /* PAGE 2 */
  doc.addPage();
  y = 18;

  // 1. OUR 20-YEAR LEAK WARRANTY (most important trust signal — first)
  y = addSectionBar(doc, 'OUR 20-YEAR LEAK WARRANTY', y);
  y = addWarranty(doc, y);

  // 2. NEXT STEPS
  y = addSectionBar(doc, 'NEXT STEPS', y);
  const postSteps = [
    'Review this proposal carefully',
    'Contact Tenzin with any questions: (959) 333-8569',
    'Sign the Roofing Agreement and submit your deposit (1/3 of total)',
    'Installation scheduled within agreed timeframe with daily photo updates',
    'Final walkthrough, punch list, and warranty documentation delivered',
  ];
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  postSteps.forEach((step, i) => { doc.text(`${i + 1}.  ${step}`, 18, y); y += 7; });
  y += 6;

  // 3. READY TO PROCEED (green deposit box)
  y = addSectionBar(doc, 'READY TO PROCEED?', y);
  const GREEN_BG     = [240, 253, 244] as [number, number, number];
  const GREEN_BORDER = [34, 197, 94]   as [number, number, number];
  const cW = 182; const cPad = 6; const cInnerW = cW - cPad * 2;
  const depositAmt = fmtMoney(Math.round(rangeMin / 3));
  const ctaLines1 = doc.splitTextToSize(`To move forward:`, cInnerW);
  const ctaSteps = [
    `1.  Sign the attached Roofing Agreement`,
    `2.  Submit your deposit of ${depositAmt} (one-third of project total)`,
    `3.  We will contact you within 24 hours to schedule your installation date`,
  ];
  const ctaFooter = doc.splitTextToSize('Questions? Call or text Tenzin directly: (959) 333-8569', cInnerW);
  doc.setFontSize(9);
  const ctaH = cPad * 2 + 6 + ctaLines1.length * 5 + ctaSteps.length * 6 + 5 + ctaFooter.length * 5;
  if (y + ctaH > ph - 25) { doc.addPage(); y = 18; }
  doc.setFillColor(...GREEN_BG); doc.setDrawColor(...GREEN_BORDER); doc.setLineWidth(0.5);
  doc.roundedRect(14, y, cW, ctaH, 3, 3, 'FD');
  let cy = y + cPad;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(21, 128, 61);
  doc.text(ctaLines1, 14 + cPad, cy); cy += ctaLines1.length * 5 + 2;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK);
  ctaSteps.forEach(step => { doc.text(step, 14 + cPad, cy); cy += 6; });
  cy += 3;
  doc.setFont('helvetica', 'italic'); doc.setTextColor(21, 128, 61);
  doc.text(ctaFooter, 14 + cPad, cy);
  y += ctaH + 10;

  // 4. WHY TRUST PROOF ROOFING
  y = addSectionBar(doc, 'WHY TRUST PROOF ROOFING', y);
  y = addWhyTrustProof(doc, y);

  // 5. PROPOSAL ACCEPTANCE (always last — signature block)
  y = addSectionBar(doc, 'PROPOSAL ACCEPTANCE', y);
  const aW = 182; const aPad = 5; const aInnerW = aW - aPad * 2;

  const acceptIntro = doc.splitTextToSize(
    'By signing below, the homeowner acknowledges receipt of this proposal, agrees to the scope of work, pricing, and conditional pricing terms described herein, and authorizes Trust Proof Roofing LLC to proceed upon execution of the full Roofing Agreement.',
    aInnerW
  );
  const finePrint = doc.splitTextToSize(
    "This proposal is valid for 30 days from the date of issue. Acceptance is subject to execution of Trust Proof Roofing LLC\u2019s standard Roofing Agreement, which includes Connecticut Home Improvement Act disclosures, 3-day cancellation rights, and full warranty terms.",
    aInnerW
  );
  doc.setFontSize(9);
  const aBodyH = acceptIntro.length * 4.5 + 5 + 8 + 8 + 5 + 8 + 8 + 5 + finePrint.length * 4.5 + 5;
  const aH = aBodyH + aPad * 2;

  if (y + aH > ph - 25) { doc.addPage(); y = 18; }
  doc.setFillColor(249, 250, 251); doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.4);
  doc.roundedRect(14, y, aW, aH, 2, 2, 'FD');

  let ay = y + aPad + 3;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...DARK);
  doc.text(acceptIntro, 14 + aPad, ay); ay += acceptIntro.length * 4.5 + 6;

  doc.text('Homeowner Signature: _________________________  Date: ___________', 14 + aPad, ay); ay += 7;
  doc.text('Printed Name: _________________________', 14 + aPad, ay); ay += 10;

  doc.text('Contractor Signature: _________________________  Date: ___________', 14 + aPad, ay); ay += 6;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...NAVY);
  doc.text('Tenzin \u2014 Trust Proof Roofing LLC', 14 + aPad, ay); ay += 8;

  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...GRAY);
  doc.text(finePrint, 14 + aPad, ay);

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
      material, priceBreakdown, scopeNotes, leadId, proposalType,
    } = body;

    const isPre = proposalType === 'pre';
    const firstName = (name as string).split(' ')[0];
    const displayAddress = sanitizeAddress(address as string);
    const fmtPhone = formatPhone(phone as string);
    const { rangeMin, rangeMax, lineItems, subtotal } = priceBreakdown as PriceBreakdown;
    const materialLabel = material === 'premium'
      ? 'Premium Asphalt (GAF Timberline UHDZ, 50-yr mfr warranty)'
      : 'Standard Asphalt (GAF Timberline HDZ, 30-yr mfr warranty)';
    const addOnsLabel = (addOns as string[]).join(', ') || 'None';

    const sectionsArr = (sections as QuoteSection[]) || [];
    const totalSqft = sectionsArr.reduce((s, r) => s + (r.sqft || 0), 0);

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

    // Email 1 — owner notification
    await resend.emails.send({
      from: 'leads@trustproofroofing.com',
      to: 'info@trustproofroofing.com',
      subject: `${isPre ? 'Preliminary Estimate' : 'Quote'} Sent: ${name} — ${displayAddress}`,
      html: `
        <div style="font-family:sans-serif;max-width:540px;margin:0 auto">
          <div style="background:#1B3C6B;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
            <h2 style="margin:0;font-size:18px">${isPre ? 'Preliminary Estimate' : 'Quote'} Sent to Homeowner</h2>
            <p style="margin:4px 0 0;opacity:0.7;font-size:13px">${isPre ? 'Pre-inspection estimate' : 'Post-inspection proposal'} — PDF attached</p>
          </div>
          <div style="border:1px solid #e5e7eb;border-top:none;padding:20px 24px;border-radius:0 0 12px 12px">
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="color:#6b7280;padding:6px 0;width:140px">Name</td><td style="font-weight:600">${name}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Address</td><td>${displayAddress}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Phone</td><td>${fmtPhone}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Email</td><td>${email}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Type</td><td>${isPre ? 'Pre-inspection (range only)' : 'Post-inspection (exact pricing)'}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Material</td><td>${materialLabel}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0">Add-ons</td><td>${addOnsLabel}</td></tr>
            </table>
            <div style="background:#1B3C6B;color:#fff;border-radius:8px;padding:14px 18px;margin-top:16px">
              <p style="margin:0;font-size:11px;opacity:0.7">${isPre ? 'Estimate Range' : 'Price Range Sent'}</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:700">${fmtMoney(rangeMin)} – ${fmtMoney(rangeMax)}</p>
            </div>
            ${scopeNotes ? `<div style="margin-top:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px"><p style="margin:0;font-size:12px;color:#6b7280;font-weight:600;margin-bottom:4px">Scope Notes</p><p style="margin:0;font-size:13px;color:#374151">${scopeNotes}</p></div>` : ''}
          </div>
        </div>`,
    });

    // Email 2 — homeowner
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
              <p style="margin:0;font-size:12px;opacity:0.7;text-transform:uppercase;letter-spacing:0.05em">${isPre ? 'Preliminary Estimate Range' : 'Project Investment'}</p>
              <p style="margin:8px 0 4px;font-size:32px;font-weight:800;line-height:1">${fmtMoney(rangeMin)} – ${fmtMoney(rangeMax)}</p>
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
