// app/api/dev/link-artist/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artistId = searchParams.get('artistId');

  if (!artistId) {
    return NextResponse.json({ error: 'Missing artistId' }, { status: 400 });
  }

  // normaler (authentifizierter) Client – respektiert RLS
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // 1) Versuch über RLS
  const upd = await supabase.from('artists').update({ user_id: user.id }).eq('id', artistId);
  if (!upd.error) {
    return NextResponse.json({ ok: true, mode: 'rls', artistId, userId: user.id });
  }

  // 2) Fallback (optional): Service-Role nutzen, falls KEY vorhanden (nur DEV!)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const admin = createClient(url, serviceKey);
    const upd2 = await admin.from('artists').update({ user_id: user.id }).eq('id', artistId);
    if (!upd2.error) {
      return NextResponse.json({ ok: true, mode: 'service', artistId, userId: user.id });
    }
    return NextResponse.json({ error: upd2.error.message, step: 'service' }, { status: 400 });
  }

  // Wenn keine Service-Role vorhanden und RLS blockt:
  return NextResponse.json(
    {
      error: upd.error.message,
      hint:
        'RLS blockiert vermutlich das Update. Entweder SUPABASE_SERVICE_ROLE_KEY in .env.local setzen (nur lokal!) oder kurzzeitig Policy erweitern.',
      step: 'rls',
    },
    { status: 400 }
  );
}
