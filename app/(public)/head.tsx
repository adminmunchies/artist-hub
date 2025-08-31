import { SITE_URL } from "@/lib/site"

export default function Head() {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")

  // WebSite + SearchAction (bleibt wie gehabt, Target = /search)
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": base,
    "name": "Munchies Art Club",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${base}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <>
      {/* Feed Discovery + großes Image-Preview */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Munchies Art Club — News & Articles"
        href={`${base}/rss.xml`}
      />
      <meta name="robots" content="max-image-preview:large" />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
    </>
  )
}
