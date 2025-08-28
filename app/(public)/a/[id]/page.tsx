import Link from "next/link";
import NewsSection from "./NewsSection";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> };

function pickImage(w: any): string | null {
  const urlCandidates = ["cover_url","image_url","thumbnail_url","thumb_url","url","cover","image","thumbnail"];
  for (const k of urlCandidates) {
    const v = w?.[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  const arrayCandidates = ["images","photos","media","files","assets"];
  for (const k of arrayCandidates) {
    const arr = w?.[k];
    if (Array.isArray(arr) && arr[0]) return String(arr[0]);
  }
  const jsonCandidates = ["cover_json","image_json","thumbnail_json"];
  for (const k of jsonCandidates) {
    const o = w?.[k];
    if (o && typeof o === "object" && typeof o.url === "string") return o.url;
  }
  return null;
}

const asHttp = (u?: string | null) => (!u ? null : /^https?:\/\//i.test(u) ? u : `https://${u}`);

export default async function ArtistPublicPage({ params }: Params) {
  const { id } = await params; // Next 15: params ist Promise
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookies) {
          try {
            cookies.forEach(({ name, value, options }: any) =>
              cookieStore.set({ name, value, ...options })
            );
          } catch {}
        },
      },
    }
  );

  const { data: artist } = await supabase
    .from("artists")
    .select("id, name, city, bio, instagram_url, website_url, avatar_url, disciplines")
    .eq("id", id)
    .maybeSingle();

  // Öffentlich nur veröffentlichte Works zeigen
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
        <img
          src={avatar}
          alt={artist?.name ?? "Avatar"}
          className="w-20 h-20 rounded-xl object-cover border"
        />
        <div className="flex-1">
          {Array.isArray(artist?.disciplines) && artist!.disciplines.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {artist!.disciplines.map((d: string) => (
                <span
                  key={d}
                  className="inline-block rounded-full border px-3 py-1 text-sm"
                >
                  {d}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-700">
            {artist?.city && <span>📍 {artist.city}</span>}
            {artist?.website_url && (
              <a
                href={asHttp(artist.website_url)!}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Website
              </a>
            )}
            {artist?.instagram_url && (
              <a
                href={asHttp(artist.instagram_url)!}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      {artist?.bio && (
        <p className="mt-6 text-gray-800 leading-relaxed">{artist.bio}</p>
      )}

      {/* 🔼 News jetzt direkt unter dem Header/Bio */}
      <NewsSection artistId={id} />

      {/* Artworks darunter */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">Artworks</h2>
      {works && works.length > 0 ? (
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
