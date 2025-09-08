import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getSupabaseServer() {
  const cookieStore = await cookies();
  const hdrs = await headers();

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
    global: {
      headers: {
        "X-Client-Info": "artist-hub",
        "X-Forwarded-For": hdrs.get("x-forwarded-for") ?? "",
      },
    },
  });

  return supabase;
}

export async function createServerSupabase() {
  return getSupabaseServer();
}
