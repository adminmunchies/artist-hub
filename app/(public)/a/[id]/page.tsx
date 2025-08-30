import Link from "next/link";
import NewsSection from "./NewsSection";
import TagLink from "@/components/TagLink";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> };

function pickImage(w: any): string | null {
  const urlCandidates = ["cover_url", "image_url", "thumbnail_url", "thumb_url", "url", "cover", "image", "thumbnail"];
  for (const k of urlCandidates) {
    const v = w?.[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  const arrayCandidates = ["images", "photos", "media", "files", "assets"];
  for (const k of arrayCandidates) {
    const arr = w?.[k];
    if (Array.isArray(arr) && arr[0]) return String(arr[0]);
  }
  const jsonCandidates = ["cover_json", "image_json", "thumbnail_json"];
  for (const k of jsonCandidates) {
    const o = w?.[k];
    if (o && typeof o === "object" && typeof o.url === "string") return o.url;
  }
  return null;
}

const asHttp = (u?: string | null) => (!u ? null : /^https?:\/\//i.test(u) ? u : `https://${u}`);

export default async function ArtistPublicPage({ params }: Params) {
  const { id } = await params; // Next 15: params ist Promise
  const supabase = await getSupabaseServer();

  // Artist + Tags laden
  const { data: artist } = await supabase
    .from("artists")
    .select("id,name,city,bio,instagram_url,website_url,avatar_url,disciplines,tags")
    .eq("id", id)
    .maybeSingle();

  // Öffentlich nur veröffentlichte Works anzeigen
  const { data: works } = await supabase
    .from("works")
    .select("*")
    .eq("artist_id", id)
    .eq("published", true)
    .order("created_at", { ascending: false });

  const avatar =
    artist?.avatar_url || "https://placehold.co/96x96?text=A&font=source-sans-pro";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold">{artist?.name || "Artist"}</h1>

      <div className="mt-4 flex items-start gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt={artist?.name ?? "Avatar"}
          className="w-20 h-20 rounded-xl object-cover border"
        />
        <div className="flex-1">
          {/* Disciplines & Tags als klickbare Chips -> /search?q=... */}
          <div className="flex flex-wrap gap-2">
            {(artist?.disciplines ?? []).map((d) => <TagLink key={d} tag={d} />)}
            {(artist?.tags ?? []).map((t) => <TagLink key={t} tag={t} />)}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-700">
            {artist?.city && <span>📍 {artist.city}</span>}
            {artist?.website_url && (
              <a href={asHttp(artist.website_url)!} target="_blank" rel="noreferrer" className="underline">
                Website
              </a>
            )}
            {artist?.instagram_url && (
              <a href={asHttp(artist.instagram_url)!} target="_blank" rel="noreferrer" className="underline">
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      {artist?.bio && (
        <p className="mt-6 text-gray-800 leading-relaxed">{artist.bio}</p>
      )}

      {/* News direkt unter dem Header/Bio */}
      <NewsSection artistId={id} />

      {/* Artworks darunter */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">Artworks</h2>
      {Array.isArray(works) && works.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {works.map((w: any) => {
            const imgSrc = pickImage(w);
            return (
              <Link
                key={w.id}
                href={`/w/${w.id}`}
                className="rounded-xl border p-2 block hover:shadow-md transition"
                prefetch={false}
              >
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc}
                    alt={w.title ?? "Artwork"}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-lg border flex items-center justify-center text-xs text-gray-500">
                    No image
                  </div>
                )}
                <div className="mt-2 text-sm">{w.title ?? "Untitled"}</div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-600">No published works yet.</p>
      )}
    </div>
  );
}
