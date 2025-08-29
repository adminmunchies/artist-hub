import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { routes } from "@/lib/routes";

type SiteSettings = {
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

function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M16.5 7.5h.01" />
    </svg>
  );
}
function IconBluesky(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M20 6c-4 1-7 4-8 8-1 4-4 7-8 8 1-4 4-7 8-8 4-1 7-4 8-8Z" />
    </svg>
  );
}
function IconYouTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23 12c0-2-.2-3.3-.4-4-.2-.8-.8-1.4-1.6-1.6C19.8 6 12 6 12 6s-7.8 0-9 .4c-.8.2-1.4.8-1.6 1.6C1.2 8.7 1 10 1 12s.2 3.3.4 4c.2.8.8 1.4 1.6 1.6 1.2.4 9 .4 9 .4s7.8 0 9-.4c.8-.2 1.4-.8 1.6-1.6.2-.7.4-2 .4-4Zm-13 3.2V8.8l4.8 3.2-4.8 3.2Z"/>
    </svg>
  );
}
function IconTiktok(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14 3c.6 2.2 1.9 3.9 4 4.6v2.2c-1.8-.2-3.3-.8-4-1.5v6.6a5.5 5.5 0 1 1-2.2-4.4V7h2.2V3H14ZM9.5 18.3a3.3 3.3 0 0 0 3.3-3.3v-2A3.3 3.3 0 1 0 9.5 18.3Z"/>
    </svg>
  );
}

async function getSettings(): Promise<SiteSettings> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("site_settings")
    .select(
      "website_url, footer_tagline, footer_logo_url, instagram_url, bluesky_url, youtube_url, tiktok_url, privacy_url, terms_url, ask_kurt_url, ask_kurt_image_url, artist_submit_url, artist_submit_image_url"
    )
    .single();
  return (data as SiteSettings) ?? ({} as SiteSettings);
}

export default async function Footer() {
  const s = await getSettings();

  const websiteUrl = s.website_url ?? "/";
  const year = new Date().getFullYear();

  const socials = [
    { href: s.instagram_url, label: "Instagram", icon: IconInstagram },
    { href: s.bluesky_url, label: "Bluesky", icon: IconBluesky },
    { href: s.youtube_url, label: "YouTube", icon: IconYouTube },
    { href: s.tiktok_url, label: "TikTok", icon: IconTiktok },
  ].filter((x) => !!x.href) as { href: string; label: string; icon: (p: any) => JSX.Element }[];

  const promos = [
    { href: s.ask_kurt_url, img: s.ask_kurt_image_url, alt: "Ask Kurt" },
    { href: s.artist_submit_url, img: s.artist_submit_image_url, alt: "Artist Page" },
  ].filter((p) => p.href && p.img) as { href: string; img: string; alt: string }[];

  const privacyHref = s.privacy_url ?? routes?.privacy ?? "/privacy";
  const termsHref = s.terms_url ?? routes?.terms ?? "/terms";

  return (
    <footer className="mt-12 border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-base text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Artist Hub</span> — A micro-page project by{" "}
            <a href={websiteUrl} className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer">
              Munchies Art Club
            </a>.
          </p>

          {socials.length > 0 && (
            <div className="flex items-center gap-3">
              {socials.map(({ href, label, icon: Icon }) => (
                <a key={label} href={href!} target="_blank" rel="noopener noreferrer" aria-label={label}
                   className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {promos.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {promos.map((p) => (
              <a key={p.alt} href={p.href!} className="group block overflow-hidden rounded-xl border">
                <img src={p.img!} alt={p.alt} loading="lazy"
                     className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
              </a>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <a href={privacyHref} className="hover:underline">Privacy</a>
            <span>•</span>
            <a href={termsHref} className="hover:underline">Terms</a>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">© {year} Munchies Art Club</div>
        </div>
      </div>
    </footer>
  );
}
