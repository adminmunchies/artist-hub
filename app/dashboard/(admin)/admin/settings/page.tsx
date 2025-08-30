import { getSupabaseServer } from "@/lib/supabaseServer";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const s = data ?? {};

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Site Settings</h1>

      <form action="/api/admin/site-settings" method="post" className="space-y-6">
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Website URL</span>
            <input name="website_url" defaultValue={s.website_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm">Footer Tagline</span>
            <input name="footer_tagline" defaultValue={s.footer_tagline ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm">Footer Logo URL (direct)</span>
            <input name="footer_logo_url" defaultValue={s.footer_logo_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>
        </fieldset>

        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Instagram URL</span>
            <input name="instagram_url" defaultValue={s.instagram_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>
          <label className="block">
            <span className="text-sm">Bluesky URL</span>
            <input name="bluesky_url" defaultValue={s.bluesky_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>
          <label className="block">
            <span className="text-sm">YouTube URL</span>
            <input name="youtube_url" defaultValue={s.youtube_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>
          <label className="block">
            <span className="text-sm">TikTok URL</span>
            <input name="tiktok_url" defaultValue={s.tiktok_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>
        </fieldset>

        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Privacy URL</span>
            <input name="privacy_url" defaultValue={s.privacy_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>
          <label className="block">
            <span className="text-sm">Terms URL</span>
            <input name="terms_url" defaultValue={s.terms_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>
        </fieldset>

        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <span className="text-sm">Ask Kurt URL</span>
            <input name="ask_kurt_url" defaultValue={s.ask_kurt_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm">Ask Kurt Image URL</span>
            <input name="ask_kurt_image_url" defaultValue={s.ask_kurt_image_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm">Artist Submit URL</span>
            <input name="artist_submit_url" defaultValue={s.artist_submit_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm">Artist Submit Image URL</span>
            <input name="artist_submit_image_url" defaultValue={s.artist_submit_image_url ?? ""} className="mt-1 w-full border rounded-md p-2" />
          </label>
        </fieldset>

        <div className="pt-2">
          <button type="submit" className="px-4 py-2 rounded-md bg-black text-white">Save</button>
        </div>
      </form>
    </div>
  );
}

