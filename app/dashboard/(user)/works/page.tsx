// app/dashboard/works/page.tsx
import Link from "next/link";
import { routes } from "@/lib/routes";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type WorkRow = {
  id: string;
  title: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  published: boolean | null;
};

export default async function WorksPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Works</h1>
        <p className="text-red-600">Not authenticated.</p>
      </main>
    );
  }

  // Eigene Artist-ID holen
  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Works</h1>
        <Link href={routes.dashboardWorkNew()} className="rounded-full border px-4 py-2">
          New Work
        </Link>
      </div>

      {!artist?.id ? (
        <p>No artist profile yet.</p>
      ) : (
        await (async () => {
          const { data: works } = await supabase
            .from("works")
            .select("id,title,thumbnail_url,image_url,published")
            .eq("artist_id", artist.id)             // falls dein Feld anders heißt (zB owner_id), hier umstellen
            .order("created_at", { ascending: false });

          if (!works || works.length === 0) {
            return <p>No works yet.</p>;
          }

          return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {works.map((w: WorkRow) => {
                const src = w.thumbnail_url || w.image_url || "";
                return (
                  <Link
                    key={w.id}
                    href={routes.dashboardWorkEdit(w.id)}
                    className="block rounded-2xl border overflow-hidden hover:shadow-sm transition-shadow"
                  >
                    <div className="aspect-[4/3] bg-gray-100">
                      {src ? (
                        // absichtlich <img>, um Next/Image-Konfig-Stress zu vermeiden
                        <img
                          src={src}
                          alt={w.title ?? "Work image"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="px-3 py-2 text-sm">{w.title ?? "Untitled"}</div>
                  </Link>
                );
              })}
            </div>
          );
        })()
      )}
    </main>
  );
}
