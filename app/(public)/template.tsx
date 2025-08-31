import Script from "next/script"
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
      "target": `${base}/artists?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }
  return (
    <>
      <Script
        id="website-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      {children}
    </>
  )
}
