// app/auth/signout/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await getSupabaseServer();
  // Session serverseitig beenden (Cookie wird gelöscht)
  await supabase.auth.signOut();

  // zurück auf die Startseite
  const url = new URL("/", request.url);
  return NextResponse.redirect(url);
}

// falls irgendwo ein POST aufgerufen wird, gleicher Effekt
export async function POST(request: Request) {
  return GET(request);
}
