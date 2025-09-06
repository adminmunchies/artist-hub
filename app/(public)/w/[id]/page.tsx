import Link from "next/link";
import TagLink from "@/components/TagLink";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { SITE_URL, toAbsolute } from "@/lib/site";
import type { Metadata } from "next";

type Work = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  artist_id: string | null;
  published: boolean | null;
  tags?: string[] | null;
  created_at?: string | null;
};
type Artist = { id: string; name: string | null };

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> };

const pickImage = (w?: Partial<Work> | null): string | null => {
  if (!w) return null;
  const v = w.image_url || w.thumbnail_url;
  return typeof v === "string" && v.trim() ? v : null;
};

// ----- SEO / Social -----
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: w } = await supabase
    .from("works")
    .select("id,title,description,created_at,artist_id,published,image_url,thumbnail_url")
    .eq("id", id)
    .maybeSingle();

  const url = `${SITE_URL}/w/${id}`;
  const title = w?.title ?? "Artwork";
  const description = w?.description ?? "Artwork on Munchies Art Club";
  const img = toAbsolute(pickImage(w)) ?? `${SITE_URL}/og-default.png`;
  const alt = `Artwork — ${title}`;

  if (!w || w.published !== true) {
    return {
      title,
      description,
      alternates: { canonical: url },
      robots: { index: false, follow: false },
    };
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", images: [{ url: img, alt }] },
    twitter: { card: "summary_large_image", title, description, images: [{ url: img, alt }] },
  };
}

export default async function WorkPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: work } = await supabase
    .from("works")
    .select("id,title,description,image_url,thumbnail_url,artist_id,published,tags,created_at")
    .eq("id", id)
    .maybeSingle();

  if (!work || work.published !== true) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-red-600">Work not found.</p>
        <Link href="/" className="underline">Back home</Link>
      </main>
    );
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("id,name")
    .eq("id", work.artist_id)
    .maybeSingle();

  // Siblings (alle veröffentlichten Werke desselben Artists)
  const { data: siblings = [] } = await supabase
    .from("works")
    .select("id,title,image_url,thumbnail_url,created_at")
    .eq("artist_id", work.artist_id)
    .eq("published", true)
    .order("created_at", { ascending: true });

  const idx = siblings.findIndex((w) => w.id === work.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const artistName = artist?.name ?? "Artist";
  const img = toAbsolute(pickImage(work));
  const alt = `${artistName} — ${work.title ?? "Untitled"}`;
  const nextImg = toAbsolute(pickImage(next as any) || null);

  // JSON-LD (VisualArtwork)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "@id": `${SITE_URL}/w/${id}`,
    url: `${SITE_URL}/w/${id}`,
    name: work.title ?? "Artwork",
    description: work.description ?? "",
    image: img ? [img] : undefined,
    contentUrl: img ?? undefined,
    thumbnailUrl: img ?? undefined,
    creator: artist?.name
      ? { "@type": "Person", name: artist.name, "@id": `${SITE_URL}/a/${artist.id}` }
      : undefined,
    dateCreated: work.created_at ?? undefined,
    keywords: Array.isArray(work.tags) ? work.tags : undefined,
    creditText: artist?.name ? `Image courtesy of ${artist.name}` : undefined,
    publisher: { "@type": "Organization", name: "Munchies Art Club" },
  };

  return (
    <main
      className="mx-auto max-w-6xl px-4 py-8"
      data-prev={prev ? `/w/${prev.id}` : ""}
      data-next={next ? `/w/${next.id}` : ""}
      id="work-detail-root"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href={`/a/${artist?.id ?? ""}`} className="text-sm underline">← Back to artist</Link>

        {/* Prev / Next Buttons (oben klein) */}
        {(prev || next) && (
          <div className="flex items-center gap-2 text-sm">
            {prev ? (
              <Link href={`/w/${prev.id}`} rel="prev" className="rounded-full border px-3 py-1">
                ← Prev
              </Link>
            ) : (
              <span className="px-3 py-1 text-gray-400">← Prev</span>
            )}
            {next ? (
              <Link href={`/w/${next.id}`} rel="next" className="rounded-full border px-3 py-1">
                Next →
              </Link>
            ) : (
              <span className="px-3 py-1 text-gray-400">Next →</span>
            )}
          </div>
        )}
      </div>

      <h1 className="mb-4 text-2xl font-semibold">{work.title ?? "Untitled"}</h1>

      <figure>
        {img ? (
          // Rahmenlos, objekt-contain (Portrait & Landscape)
          <div className="w-full overflow-hidden">
            <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={alt}
                className="absolute inset-0 h-full w-full object-contain border-0"
                decoding="async"
                fetchPriority="high"
                loading="eager"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-[50vh] w-full items-center justify-center bg-gray-100 text-gray-400">
            No image
          </div>
        )}
        <figcaption className="mt-2 text-sm text-gray-500">
          Image courtesy of {artistName}
        </figcaption>
      </figure>

      {work.description ? <p className="mt-4 max-w-3xl text-gray-700">{work.description}</p> : null}

      {(work.tags ?? []).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(work.tags ?? []).map((t) => <TagLink key={t} tag={t} />)}
        </div>
      )}

      {/* Untere, große Prev/Next-Navigation */}
      {(prev || next) && (
        <nav className="mt-10 flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/w/${prev.id}`}
              rel="prev"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2"
            >
              ← Previous
            </Link>
          ) : <span />}
          {next ? (
            <Link
              href={`/w/${next.id}`}
              rel="next"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2"
            >
              Next →
            </Link>
          ) : <span />}
        </nav>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Preload des nächsten Bildes (sanft) */}
      {nextImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={nextImg} alt="" aria-hidden="true" className="hidden" />
      ) : null}

      {/* Kleine Inline-Enhancements: ←/→ & Swipe */}
      <script
        // minimal & isoliert: nutzt data-prev/next vom Root
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  var root = document.getElementById('work-detail-root');
  if(!root) return;
  var prev = root.getAttribute('data-prev');
  var next = root.getAttribute('data-next');

  // Arrow keys
  window.addEventListener('keydown', function(e){
    if (e.key === 'ArrowLeft' && prev) { window.location.href = prev; }
    if (e.key === 'ArrowRight' && next) { window.location.href = next; }
  }, { passive: true });

  // Touch swipe
  var startX = 0, startY = 0, t0 = 0;
  window.addEventListener('touchstart', function(e){
    var t = e.changedTouches[0]; startX = t.clientX; startY = t.clientY; t0 = Date.now();
  }, { passive: true });
  window.addEventListener('touchend', function(e){
    var t = e.changedTouches[0];
    var dx = t.clientX - startX;
    var dy = Math.abs(t.clientY - startY);
    var dt = Date.now() - t0;
    // horizontal, kurz, nicht zu viel vertikal
    if (dt < 800 && dy < 60) {
      if (dx > 60 && prev) window.location.href = prev;     // swipe right -> prev
      if (dx < -60 && next) window.location.href = next;    // swipe left  -> next
    }
  }, { passive: true });
})();`
        }}
      />
    </main>
  );
}
