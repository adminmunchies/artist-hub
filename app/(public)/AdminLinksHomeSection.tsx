// app/(public)/AdminLinksHomeSection.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLinksHomeSection() {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("admin_links")
    .select("id,title,url,image_url,excerpt,tags,created_at,featured,published")
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (!data || data.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <h2 className="text-2xl font-semibold">Editor’s Picks</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((l) => (
          <div
            key={l.id}
            className="rounded-2xl border overflow-hidden hover:shadow transition"
          >
            {/* Nur dieser Block ist der externe Link */}
            <a href={l.url} target="_blank" rel="noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {l.image_url ? (
                <img
                  src={l.image_url}
                  alt={l.title || "link"}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-44 w-full bg-gray-100" />
              )}

              <div className="px-3 py-2">
                <div className="font-medium truncate">
                  {l.title || l.url}
                </div>
                {l.excerpt ? (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {l.excerpt}
                  </p>
                ) : null}
              </div>
            </a>

            {/* Tags sind SEPARAT (keine verschachtelten <a>) */}
            {Array.isArray(l.tags) && l.tags.length > 0 ? (
              <div className="px-3 pb-3 flex flex-wrap gap-2">
                {l.tags.slice(0, 5).map((t: string) => (
                  <Link
                    key={t}
                    href={`/artists?q=${encodeURIComponent(t)}`}
                    className="rounded-full border px-2 py-0.5 text-xs hover:bg-gray-50"
                    prefetch={false}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
