import { SITE_URL } from "@/lib/site"

export default function Head() {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  return (
    <>
      {/* SEO: große Bildvorschau erlauben */}
      <meta name="robots" content="max-image-preview:large" />
      {/* RSS Feed für News/Articles */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Munchies Art Club — News & Articles"
        href={`${base}/rss.xml`}
      />
    </>
  )
}
