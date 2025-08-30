import { getSiteSettings } from "@/lib/siteSettings";
import { Instagram, Youtube, Music2, Bird } from "lucide-react";

export const revalidate = 0;

function LinkItem({ href, label }: { href?: string | null; label: string }) {
  if (!href) return null;
  return (
    <li>
      <a href={href} className="hover:underline" target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    </li>
  );
}

function ExternalLink({
  href,
  children,
  className = "",
}: {
  href?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 hover:underline ${className}`}
    >
      {children}
    </a>
  );
}

function Promo({
  href,
  img,
  alt,
}: {
  href?: string | null;
  img?: string | null;
  alt: string;
}) {
  if (!href) return null;
  return (
    <a href={href} className="block rounded-2xl overflow-hidden border">
      {img ? (
        <img src={img} alt={alt} className="w-full h-28 object-cover" />
      ) : (
        <div className="h-28 flex items-center justify-center text-sm">{alt}</div>
      )}
    </a>
  );
}

export default async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  // Standard-Ziel für klickbares Logo und Website-Link
  const defaultSiteUrl = "https://www.munchiesart.club";
  const siteUrl = settings?.website_url || defaultSiteUrl;

  // Label für Website-Link statt "Website" -> Domain-Name
  const siteName = (() => {
    try {
      return new URL(siteUrl).host;
    } catch {
      return "munchiesart.club";
    }
  })();

  return (
    <footer className="mt-16 border-t">
      {/* Hauptbereich */}
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-10 md:grid-cols-4">
        {/* Brand / Tagline */}
        <div className="space-y-3">
          {settings?.footer_logo_url ? (
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
              <img src={settings.footer_logo_url} alt="Munchies Art Club Logo" className="h-10 w-auto" />
            </a>
          ) : null}
          {settings?.footer_tagline ? (
            <p className="text-sm leading-relaxed">{settings.footer_tagline}</p>
          ) : null}
        </div>

        {/* Legal/Links */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Links</h3>
          <ul className="space-y-2 text-sm">
            <LinkItem href={settings?.privacy_url ?? undefined} label="Privacy" />
            <LinkItem href={settings?.terms_url ?? undefined} label="Terms" />
            <LinkItem href={siteUrl} label={siteName} />
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Social</h3>
          <div className="flex flex-col gap-2 text-sm">
            <ExternalLink href={settings?.instagram_url}>
              <Instagram className="h-4 w-4" />
              <span>Instagram</span>
            </ExternalLink>
            <ExternalLink href={settings?.bluesky_url}>
              <Bird className="h-4 w-4" />
              <span>Bluesky</span>
            </ExternalLink>
            <ExternalLink href={settings?.youtube_url}>
              <Youtube className="h-4 w-4" />
              <span>YouTube</span>
            </ExternalLink>
            <ExternalLink href={settings?.tiktok_url}>
              <Music2 className="h-4 w-4" />
              <span>TikTok</span>
            </ExternalLink>
          </div>
        </div>

        {/* Promo-Karten */}
        <div className="space-y-4">
          <Promo
            href={settings?.ask_kurt_url ?? undefined}
            img={settings?.ask_kurt_image_url ?? undefined}
            alt="Ask Kurt"
          />
          <Promo
            href={settings?.artist_submit_url ?? undefined}
            img={settings?.artist_submit_image_url ?? undefined}
            alt="Artist Submit"
          />
        </div>
      </div>

      {/* Untere Fußleiste (Copyright ganz unten) */}
      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-neutral-500 flex items-center justify-between">
          <span>© {year} {siteName}</span>
        </div>
      </div>
    </footer>
  );
}
