// lib/currentArtist.ts
import { createServerSupabase } from "@/lib/supabaseServer";

export async function getCurrentArtistId() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("artists")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  return data?.id ?? null;
}
