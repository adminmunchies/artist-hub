import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const supa = await getSupabaseServer();
  await supa.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
