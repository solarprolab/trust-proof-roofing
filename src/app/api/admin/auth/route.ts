import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'trustproof2024';

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  }
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
