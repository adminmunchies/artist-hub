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

  const artistName = artist?.name ?? "Artist";
  const img = toAbsolute(pickImage(work));
  const alt = `${artistName} — ${work.title ?? "Untitled"}`;

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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/a/${artist?.id ?? ""}`} className="text-sm underline">← Back to artist</Link>
      </div>

      <h1 className="mb-4 text-2xl font-semibold">{work.title ?? "Untitled"}</h1>

      <figure>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={alt}
            className="mx-auto block w-full max-h-[80vh] object-contain"
            decoding="async"
            fetchPriority="high"
            loading="eager"
          />
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

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
