import { SITE_URL } from "@/lib/site"

export default function Head() {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": base,
    "name": "Munchies Art Club",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${base}/artists?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
    </>
  )
}
