import { ImageResponse } from "next/og"

export const runtime = "edge"
export const revalidate = 60

const BASE = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function fetchNews(id: string) {
  const url = `${SUPA_URL}/rest/v1/artist_news?id=eq.${id}&published=eq.true&select=title,og_image,cover_image,images`
  const res = await fetch(url, { headers: { apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}` }, cache: "no-store" })
  const rows = await res.json().catch(() => [])
  return Array.isArray(rows) && rows[0] ? rows[0] : null
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const row = await fetchNews(params.id)
  const title = (row?.title || "Artist News").toString().slice(0, 120)
  const img =
    row?.og_image ||
    row?.cover_image ||
    (Array.isArray(row?.images) && row.images[0]) ||
    "/og-default.png"
  const imgAbs = /^https?:\/\//i.test(String(img)) ? String(img) : `${BASE}${String(img).startsWith("/") ? "" : "/"}${img}`

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0b0b",
          color: "white",
          padding: 48,
          backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 40%), url(${imgAbs})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.9 }}>Munchies Art Club — News</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={`${BASE}/publisher-logo.svg`} width="64" height="64" />
          <div style={{ fontSize: 24, opacity: 0.9 }}>{BASE.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
