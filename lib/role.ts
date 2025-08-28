import { getSupabaseServer } from "@/lib/supabaseServer";

export async function getRole() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false, artistId: null };

  const { data: row } = await supabase
    .from("artists")
    .select("id,is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user,
    isAdmin: !!row?.is_admin,
    artistId: row?.id ?? null,
  };
}
