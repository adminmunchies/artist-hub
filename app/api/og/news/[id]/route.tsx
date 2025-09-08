// app/api/og/news/[id]/route.tsx
import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";
import supabaseAdmin from "@/lib/supabaseAdmin"; // default export verwenden
import { OgFrame, size, contentType } from "@/lib/ogFrame";

export const runtime = "edge";
export { size, contentType };

async function fetchNews(id: string) {
  const { data } = await supabaseAdmin
    .from("artist_news")
    .select("id,title")
    .eq("id", id)
    .single();
  return data ?? null;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; // Next 15: params awaiten
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const domain = base.replace(/^https?:\/\//, "");
  const row = await fetchNews(id);
  const title = (row?.title || "Artist News").toString().slice(0, 120);

  return new ImageResponse(
    <OgFrame kicker="Munchies Art Club — News" title={title} domain={domain} />,
    {
      ...size,
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    }
  );
}
