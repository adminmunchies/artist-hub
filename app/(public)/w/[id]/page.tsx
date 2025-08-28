// app/(public)/w/[id]/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";

type Work = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  artist_id: string | null;
  published: boolean | null;
};

type Artist = { id: string; name: string | null };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WorkPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: work } = await supabase
    .from("works")
    .select("id,title,description,image_url,thumbnail_url,artist_id,published")
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
  const img = work.image_url || work.thumbnail_url;
  const alt = `${artistName} — ${work.title ?? "Untitled"}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/a/${artist?.id ?? ""}`} className="text-sm underline">
          ← Back to artist
        </Link>
      </div>

      {/* Titel */}
      <h1 className="mb-4 text-2xl font-semibold">{work.title ?? "Untitled"}</h1>

      {/* Großes Bild ohne Border, mit Weißraum */}
      <figure>
        {img ? (
          <img
            src={img}
            alt={alt}
            className="mx-auto block w-full max-h-[80vh] object-contain"
          />
        ) : (
          <div className="flex h-[50vh] w-full items-center justify-center bg-gray-100 text-gray-400">
            No image
          </div>
        )}
      </figure>

      {/* Beschreibung & Credit */}
      {work.description ? (
        <p className="mt-4 max-w-3xl text-gray-700">{work.description}</p>
      ) : null}
      <p className="mt-2 text-sm text-gray-500">Image courtesy of {artistName}</p>
    </main>
  );
}
