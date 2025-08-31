import { ImageResponse } from "next/og"
import { SITE_URL } from "@/lib/site"
import { OgFrame, size, contentType } from "@/lib/og"

export const runtime = "edge"
export { size, contentType }

function titleCaseFromSlug(slug: string) {
  return slug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const domain = base.replace(/^https?:\/\//, "")
  const title = `Tag: ${titleCaseFromSlug(slug)}`
  return new ImageResponse(
    <OgFrame kicker="Munchies Art Club — Tag" title={title} domain={domain} />,
    { ...size, headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  )
}
