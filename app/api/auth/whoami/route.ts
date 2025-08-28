// app/api/auth/whoami/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const jar = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return jar.get(name)?.value; },
        set() {}, remove() {},
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return NextResponse.json({ ok: false, error: error.message });
  return NextResponse.json({ ok: !!user, user: user ? { id: user.id, email: user.email } : null });
}
