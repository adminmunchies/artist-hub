// app/(public)/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { routes } from "@/lib/routes";
import AdminLinksHomeSection from "./AdminLinksHomeSection";
import NewsHomeSection from "./NewsHomeSection"; // ⬅️ neu: die saubere Artist-News Section

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Artist = {
  id: string;
  name: string;
  city: string | null;
  avatar_url: string | null;
};

export default async function HomePage() {
  const supabase = await getSupabaseServer();

  // 1) Artists – neueste 6
  const { data: artists } = await supabase
    .from("artists")
    .select("id,name,city,avatar_url")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* 1) Artists */}
      <h1 className="text-2xl font-semibold mb-6">Artists</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {(artists ?? []).map((a: Artist) => (
          <Link
            key={a.id}
            href={routes.artistPublic(a.id)}
            className="rounded-2xl border overflow-hidden hover:shadow-md transition"
            prefetch={false}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {a.avatar_url ? (
              <img
                src={a.avatar_url}
                alt={a.name}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-44 w-full bg-gray-100" />
            )}
            <div className="px-3 py-2">
              <div className="font-medium">{a.name}</div>
              {a.city ? (
                <div className="text-sm text-gray-500">{a.city}</div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>

      {/* 2) Editor’s Picks (aus site_articles) – unverändert */}
      <AdminLinksHomeSection />

      {/* 3) Artist News – jetzt über die saubere Section mit sichtbaren Tag-Chips */}
      <NewsHomeSection />
    </main>
  );
}
