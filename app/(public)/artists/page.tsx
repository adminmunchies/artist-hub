// app/(public)/artists/page.tsx
import Link from "next/link";
import SearchBox from "./SearchBox";
import TagLink from "@/components/TagLink";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  id: string;
  name: string | null;
  city: string | null;
  avatar_url: string | null;
  disciplines: string[] | null;
  tags: string[] | null;
};

function norm(s?: string | null) {
  return (s ?? "").toLowerCase();
}

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const needle = (q ?? "").trim().toLowerCase();

  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("artists")
    .select("id,name,city,avatar_url,disciplines,tags")
    .order("created_at", { ascending: false })
    .limit(60);

  const all = (data ?? []) as Row[];

  const rows = needle
    ? all.filter((a) => {
        const hay = [
          norm(a.name),
          norm(a.city),
          ...(a.disciplines ?? []).map((x) => x.toLowerCase()),
          ...(a.tags ?? []).map((x) => x.toLowerCase()),
        ].join(" • ");
        return hay.includes(needle);
      })
    : all;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-4">Artists</h1>

      <div className="mb-6">
        <SearchBox />
      </div>

      {needle && (
        <p className="text-sm text-gray-500 mb-4">
          Query: <span className="font-medium">{q}</span> • {rows.length} result
          {rows.length === 1 ? "" : "s"}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="text-gray-600">No artists match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((a) => {
            const hasChips =
              (a.disciplines && a.disciplines.length > 0) ||
              (a.tags && a.tags.length > 0);

            return (
              <article
                key={a.id}
                className="rounded-2xl border overflow-hidden hover:shadow-sm transition"
              >
                {/* Klickbarer Bereich (KEINE TagLinks hier rein!) */}
                <Link
                  href={`/a/${a.id}`}
                  className="block"
                  prefetch={false}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.avatar_url || "https://placehold.co/800x600?text=Artist"}
                    alt={a.name ?? "Artist"}
                    className="h-56 w-full object-cover"
                  />
                  <div className="p-3">
                    <div className="text-lg font-medium">
                      {a.name ?? "Artist"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {a.city ?? ""}
                    </div>
                  </div>
                </Link>

                {/* Chips separat unter dem Link, damit keine <a> in <a> liegt */}
                {hasChips && (
                  <div className="p-3 pt-0 border-t flex flex-wrap gap-2">
                    {(a.disciplines ?? []).slice(0, 5).map((d) => (
                      <TagLink key={`d-${a.id}-${d}`} tag={d} />
                    ))}
                    {(a.tags ?? []).slice(0, 5).map((t) => (
                      <TagLink key={`t-${a.id}-${t}`} tag={t} />
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
