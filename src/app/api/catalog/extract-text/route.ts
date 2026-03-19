import { NextRequest, NextResponse } from 'next/server';

// POST /api/catalog/extract-text
// Accepts multipart/form-data with a single field "file".
// Returns { text: string }.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (ext === 'txt' || ext === 'csv') {
      text = buffer.toString('utf-8');
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (ext === 'pdf') {
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (ext === 'xlsx' || ext === 'xls') {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const lines: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        if (csv.trim()) {
          lines.push(`=== Sheet: ${sheetName} ===`);
          lines.push(csv);
        }
      }
      text = lines.join('\n');
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: .${ext}. Accepted: .pdf, .docx, .xlsx, .csv, .txt` },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (err: any) {
    console.error('extract-text error:', err);
    return NextResponse.json({ error: err.message || 'Failed to extract text' }, { status: 500 });
  }
}
