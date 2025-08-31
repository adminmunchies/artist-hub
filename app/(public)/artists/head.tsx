import { SITE_URL } from "@/lib/site"
export default function Head() {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const og = `${base}/api/og/artists`
  return (
    <>
      <meta property="og:image" content={og} />
      <meta name="twitter:image" content={og} />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  )
}
