// app/dashboard/(admin)/settings/page.tsx
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/auth/isAdmin";
import { saveSettings } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/dashboard/works");

  const { data: s } = await supabase.from("site_settings").select("*").single();

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-semibold">Admin Settings</h1>

      <form action={saveSettings} className="rounded-2xl border p-6 grid md:grid-cols-2 gap-6">
        {/* Brand / Footer */}
        <div>
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input
            name="website_url"
            defaultValue={s?.website_url ?? ""}
            placeholder="https://www.munchiesart.club"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Footer Logo URL</label>
          <input
            name="footer_logo_url"
            defaultValue={s?.footer_logo_url ?? ""}
            placeholder="https://…/footer-logo.png"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Footer Tagline</label>
          <input
            name="footer_tagline"
            defaultValue={
              s?.footer_tagline ??
              "Artist Hub — A micro-page project by Munchies Art Club."
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {/* Social */}
        <div>
          <label className="block text-sm font-medium mb-1">Instagram</label>
          <input
            name="instagram_url"
            defaultValue={s?.instagram_url ?? ""}
            placeholder="https://www.instagram.com/munchiesartclub"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bluesky</label>
          <input
            name="bluesky_url"
            defaultValue={s?.bluesky_url ?? ""}
            placeholder="https://bsky.app/profile/…"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">YouTube</label>
          <input
            name="youtube_url"
            defaultValue={s?.youtube_url ?? ""}
            placeholder="https://www.youtube.com/@…"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">TikTok</label>
          <input
            name="tiktok_url"
            defaultValue={s?.tiktok_url ?? ""}
            placeholder="https://www.tiktok.com/@…"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {/* Rechtliches */}
        <div>
          <label className="block text-sm font-medium mb-1">Privacy URL</label>
          <input
            name="privacy_url"
            defaultValue={s?.privacy_url ?? "/privacy"}
            placeholder="/privacy"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Terms URL</label>
          <input
            name="terms_url"
            defaultValue={s?.terms_url ?? "/terms"}
            placeholder="/terms"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {/* Promo-Karten */}
        <div>
          <label className="block text-sm font-medium mb-1">Ask Kurt URL</label>
          <input
            name="ask_kurt_url"
            defaultValue={s?.ask_kurt_url ?? ""}
            placeholder="https://www.munchiesart.club/ask-kurt-a-curatorial-global-network-project/"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ask Kurt Image URL</label>
          <input
            name="ask_kurt_image_url"
            defaultValue={s?.ask_kurt_image_url ?? ""}
            placeholder="https://…/ask-kurt-banner.jpg"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Artist Page Submit URL</label>
          <input
            name="artist_submit_url"
            defaultValue={s?.artist_submit_url ?? ""}
            placeholder="https://…/submit"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Artist Page Image URL</label>
          <input
            name="artist_submit_image_url"
            defaultValue={s?.artist_submit_image_url ?? ""}
            placeholder="https://…/artist-page-banner.jpg"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            Save
          </button>
        </div>
      </form>
    </section>
  );
}
