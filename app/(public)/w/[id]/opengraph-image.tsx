/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { SITE_URL, toAbsolute } from "@/lib/site";

export const runtime = "edge";           // schnell für OG
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { params: Promise<{ id: string }> };

function pickImage(w: any): string | null {
  const v = w?.image_url || w?.thumbnail_url;
  return typeof v === "string" && v.trim() ? v : null;
}

export default async function OpengraphImage({ params }: Params) {
  const { id } = await params;
  const supa = await getSupabaseServer();

  const { data: work } = await supa
    .from("works")
    .select("id,title,image_url,thumbnail_url,artist_id,published")
    .eq("id", id)
    .maybeSingle();

  const { data: artist } = await supa
    .from("artists")
    .select("id,name")
    .eq("id", work?.artist_id ?? "")
    .maybeSingle();

  const title = (work?.title ?? "Untitled").slice(0, 80);
  const artistName = artist?.name ?? "Munchies Art Club";
  const img = toAbsolute(pickImage(work)) ?? `${SITE_URL}/og-default.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fff",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI",
        }}
      >
        {/* left image */}
        <div
          style={{
            width: "60%",
            height: "100%",
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* right text */}
        <div
          style={{
            width: "40%",
            height: "100%",
            padding: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </div>
          <div style={{ fontSize: 22, opacity: 0.8, marginTop: 8 }}>
            {artistName}
          </div>
          <div style={{ fontSize: 18, opacity: 0.7, marginTop: 24 }}>
            munchiesartclub.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
