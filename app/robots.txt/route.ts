import { SITE_URL } from "@/lib/site"

export const runtime = "nodejs"
export const revalidate = 3600

export async function GET() {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    `Sitemap: ${base}/sitemap.xml`,
    ""
  ].join("\n")
  return new Response(body, { headers: { "Content-Type": "text/plain" } })
}
