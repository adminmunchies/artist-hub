import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { routes } from "@/lib/routes";

type Params = { params: { id: string } };

export default async function WorkPublicPage({ params }: Params) {
  const supabase = await getSupabaseServer();

  const { data: work } = await supabase
    .from("works")
    .select("id,title,description,image_url,thumbnail_url,published,artist_id,created_at")
    .eq("id", params.id)
    .single();

  if (!work || !work.published) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p>Work not available.</p>
        <Link href={routes.home()} className="underline">Back home</Link>
      </div>
    );
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("id,name")
    .eq("id", work.artist_id)
    .single();

  const img = work.thumbnail_url || work.image_url || "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href={routes.artistPublic(work.artist_id)} className="text-sm underline">← Back to artist</Link>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border">
          <div className="aspect-[4/3] bg-neutral-100">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt={work.title || "work image"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">No image</div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{work.title || "Untitled"}</h1>
          {work.description ? <p className="text-sm">{work.description}</p> : null}
          <p className="text-sm text-neutral-600">
            Image courtesy of {artist?.name || "the artist"}
          </p>
        </div>
      </div>
    </div>
  );
}
