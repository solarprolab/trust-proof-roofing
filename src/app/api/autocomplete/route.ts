import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  console.log('API KEY:', process.env.GOOGLE_SOLAR_API_KEY?.slice(0, 8));
  const { searchParams } = new URL(req.url);
  const input = searchParams.get('input');
  if (!input) return NextResponse.json({ predictions: [] });
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:us&key=${process.env.GOOGLE_SOLAR_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}
