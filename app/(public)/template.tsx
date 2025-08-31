import { SITE_URL } from "@/lib/site"

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
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
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <link
        rel="alternate"
        type="application/rss+xml"
        href={`${base}/rss.xml`}
        title="Munchies Art Club — News & Articles"
      />
      <meta name="robots" content="max-image-preview:large" />
      {children}
    </>
  )
}
