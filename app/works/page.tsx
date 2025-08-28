export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabaseServer";

export default async function WorksPublicList() {
  const supabase = await createServerSupabase();
  const { data: works, error } = await supabase
    .from("works")
    .select("id, title, image_url")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    return <main className="p-6 text-red-600">Error: {error.message}</main>;
  }

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Works</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(works ?? []).map((w) => (
          <Link key={w.id} href={`/w/${w.id}`} className="group block border rounded-md overflow-hidden">
            <div className="relative aspect-video bg-gray-100">
              {w.image_url ? (
                <Image src={w.image_url} alt={w.title ?? "Work image"} fill className="object-cover group-hover:opacity-90" />
              ) : null}
            </div>
            <div className="p-3 text-sm">{w.title ?? "Untitled"}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
