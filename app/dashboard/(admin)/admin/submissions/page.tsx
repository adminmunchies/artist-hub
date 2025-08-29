import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/auth/isAdmin";
import { redirect } from "next/navigation";
import { featureNewsAsEditorsPick, toggleArtistNewsPublished } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SubmissionsPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/dashboard/works");

  // latest artists (just a quick glance)
  const { data: artists } = await supabase
    .from("artists")
    .select("id,name,city,avatar_url")
    .order("created_at", { ascending: false })
    .limit(8);

  // artist news (latest 20)
  const { data: news } = await supabase
    .from("artist_news")
    .select("id,title,url,image_url,published,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">Artists & Submissions</h1>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Recent Artists</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {(artists ?? []).map(a => (
            <a key={a.id} href={`/a/${a.id}`} className="rounded-xl border p-3 hover:bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.avatar_url || "/file.svg"} alt={a.name || "Artist"} className="h-28 w-full object-cover rounded-lg mb-2" />
              <div className="font-medium">{a.name}</div>
              {a.city ? <div className="text-sm text-gray-600">{a.city}</div> : null}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Artist News</h2>
        <div className="divide-y rounded-xl border">
          {(news ?? []).map(n => (
            <div key={n.id} className="p-4 flex items-center gap-4 justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {!n.published ? <span className="text-xs rounded-full border px-2 py-0.5">UNPUBLISHED</span> : null}
                  <a href={n.url} target="_blank" className="font-medium hover:underline truncate">
                    {n.title || n.url}
                  </a>
                </div>
                {n.image_url ? <div className="text-xs text-gray-500 mt-1 truncate">{n.image_url}</div> : null}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <form action={toggleArtistNewsPublished}>
                  <input type="hidden" name="id" value={n.id} />
                  <input type="hidden" name="published" value={(!n.published)?.toString()} />
                  <button type="submit" className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
                    {n.published ? "Unpublish" : "Publish"}
                  </button>
                </form>

                <form action={featureNewsAsEditorsPick}>
                  <input type="hidden" name="id" value={n.id} />
                  <button type="submit" className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
                    Feature → Editor’s Picks
                  </button>
                </form>
              </div>
            </div>
          ))}

          {(news ?? []).length === 0 && (
            <div className="p-6 text-sm text-gray-500">No submissions yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}
