import { ImageResponse } from "next/og"
import { SITE_URL } from "@/lib/site"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export async function GET() {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const domain = base.replace(/^https?:\/\//, "")

  return new ImageResponse(
    (
      <div style={{
        height: "100%", width: "100%", display: "flex",
        flexDirection: "column", justifyContent: "space-between",
        backgroundColor: "#0a0a0a", color: "white", padding: "64px"
      }}>
        <div style={{ fontSize: 42, opacity: 0.75, marginBottom: 12 }}>
          Munchies Art Club
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.1 }}>
          Artist News
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, background: "#111", borderRadius: 8 }} />
          <div style={{ fontSize: 32 }}>{domain}</div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" }
    }
  )
}
