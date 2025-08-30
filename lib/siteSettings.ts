import { getSupabaseServer } from "@/lib/supabaseServer";

export type SiteSettings = {
  id: number;
  website_url: string | null;
  footer_tagline: string | null;
  footer_logo_url: string | null;
  instagram_url: string | null;
  bluesky_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  privacy_url: string | null;
  terms_url: string | null;
  ask_kurt_url: string | null;
  ask_kurt_image_url: string | null;
  artist_submit_url: string | null;
  artist_submit_image_url: string | null;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return (data ?? null) as SiteSettings | null;
}

