import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');
  const password = url.searchParams.get('password');

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'Missing email or password' }, { status: 400 });
  }

  let userId: string | null = null;

  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 } as any);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    const found = data.users?.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (found) { userId = found.id; break; }
    if (!data.users || data.users.length < 1000) break;
  }

  if (userId) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true, password } as any);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, mode: 'updated', email });
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true } as any);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, mode: 'created', email });
}
