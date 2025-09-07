// lib/supabaseServer.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServer() {
  // Next 15: cookies() muss awaited werden
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // In RSCs sind Cookie-Schreibvorgänge verboten → try/catch, still bleiben
        set(name: string, value: string, options: CookieOptions) {
          try {
            // In Route Handlern/Server Actions ist das erlaubt; sonst wirft es → wegschnappen
            cookieStore.set(name, value, options);
          } catch {
            /* no-op in RSC */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch {
            /* no-op in RSC */
          }
        },
      },
    }
  );

  return supabase;
}
