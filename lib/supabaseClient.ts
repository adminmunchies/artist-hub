// lib/supabaseClient.ts
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-Client: liest/benutzt deine sb-Auth-Cookies automatisch
export const supabase = createBrowserClient(url, anon);
export default supabase;
