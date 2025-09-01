// app/(public)/AdminLinksHomeSection.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdminLink = {
  id: string;
  title: string | null;
  url: string;
  image_url: string | null;
  excerpt: string | null;
  tags: string[] | null;
  published: boolean | null;
  featured: boolean | null;
  created_at: string | null;
};

type SiteArticle = {
  id: string;
  title: string;
  url?: string | null;
  excerpt?: string | null;
  image_url?: string | null;
  og_image?: string | null;
  cover_image?: string | null;
  thumbnail_url?: string | null;
  tags?: string[] | null;
  tags_lc?: string[] | null;
  published?: boolean | null;
  featured?: boolean | null;
  created_at?: string | null;
};

type Card =
  | {
      kind: "admin";
      id: string;
      title: string;
      href: string;
      img: string;
      excerpt?: string | null;
      tags: string[];
      created_at?: string | null;
    }
  | {
      kind: "editorial";
      id: string;
      title: string;
      href: string;
      img: string;
      excerpt?: string | null;
      tags: string[];
      created_at?: string | null;
    };

// robuste Slug-Funktion für Tag-URLs
function toSlug(s: string) {
  return String(s)
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickImage(r: SiteArticle | AdminLink): string {
  const candidates = [
    (r as any).image_url,
    (r as any).og_image,
    (r as any).cover_image,
    (r as any).thumbnail_url,
    (r as any).thumbnail,
  ];
  for (const v of candidates) {
    if (typeof v === "string" && /^https?:\/\//.test(v)) return v;
  }
  return "/og-default.png"; // stabiler Fallback
}

function uniqueTags(arr: any[] | null | undefined): string[] {
  if (!arr) return [];
  const m = new Map<string, string>();
  for (const v of arr) {
    const raw = String(v ?? "").trim();
    const k = raw.toLowerCase();
    if (!k) continue;
    if (!m.has(k)) m.set(k, raw);
  }
  return Array.from(m.values()).slice(0, 5);
}

function byDateDesc(a: Card, b: Card) {
  const ta = a.created_at ? Date.parse(a.created_at) : 0;
  const tb = b.created_at ? Date.parse(b.created_at) : 0;
  return tb - ta;
}

export default async function AdminLinksHomeSection() {
  const supabase = await getSupabaseServer();

  // 1) Admin Links – nur published & featured
  const { data: admin, error: errA } = await supabase
    .from("admin_links")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(24);
  if (errA) console.error("admin_links fetch error:", errA.message);

  // 2) Redaktionelle Artikel (site_articles) – nur published & featured
  const { data: editorial, error: errE } = await supabase
    .from("site_articles")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(24);
  if (errE) console.error("site_articles fetch error:", errE.message);

  // 3) Normalisieren
  const adminCards: Card[] = (admin ?? []).map((x: AdminLink) => ({
    kind: "admin",
    id: x.id,
    title: x.title || x.url,
    href: x.url, // extern
    img: pickImage(x),
    excerpt: x.excerpt,
    tags: uniqueTags(x.tags),
    created_at: x.created_at || null,
  }));

  const editorialCards: Card[] = (editorial ?? []).map((x: SiteArticle) => ({
    kind: "editorial",
    id: x.id,
    title: x.title,
    href: `/an/${x.id}`, // intern
    img: pickImage(x),
    excerpt: x.excerpt ?? null,
    tags: uniqueTags(x.tags ?? x.tags_lc),
    created_at: x.created_at || null,
  }));

  // 4) Mergen, Dubletten bremsen, sortieren, top 12
  const seen = new Set<string>();
  const merged = [...adminCards, ...editorialCards]
    .filter((c) => {
      const key = `${c.title}::${c.href}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(byDateDesc)
    .slice(0, 12);

  if (merged.length === 0) return null;

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Editor&apos;s Picks</h2>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {merged.map((item) => (
          <article
            key={`${item.kind}-${item.id}`}
            className="rounded-2xl border overflow-hidden hover:shadow-md transition"
          >
            <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
              {item.kind === "admin" ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.title}
                  className="block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                </a>
              ) : (
                <Link href={item.href} aria-label={item.title} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                </Link>
              )}
            </div>

            <div className="p-4">
              <div className="text-xs tracking-wide uppercase opacity-70 mb-1">
                {item.kind === "admin" ? "FEATURED LINK" : "EDITORIAL"}
              </div>

              <h3 className="font-semibold leading-snug mb-1">
                {item.kind === "admin" ? (
                  <a href={item.href} target="_blank" rel="noreferrer noopener" className="hover:underline">
                    {item.title}
                  </a>
                ) : (
                  <Link href={item.href} className="hover:underline">
                    {item.title}
                  </Link>
                )}
              </h3>

              {item.excerpt ? <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.excerpt}</p> : null}

              {item.tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((t, i) => (
                    <Link
                      key={`${String(t)}-${i}`}
                      href={`/tag/${encodeURIComponent(toSlug(String(t)))}`}
                      className="text-xs rounded-full border px-3 py-1 hover:bg-gray-50"
                      prefetch={false}
                      aria-label={`Tag ${String(t)}`}
                    >
                      {String(t)}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
