import { ImageResponse } from "next/og"
import { SITE_URL } from "@/lib/site"
import { OgFrame, size, contentType } from "@/lib/og"

export const runtime = "edge"
export { size, contentType }

export async function GET() {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const domain = base.replace(/^https?:\/\//, "")
  return new ImageResponse(
    <OgFrame kicker="Munchies Art Club" title="Artist News" domain={domain} />,
    { ...size, headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  )
}
