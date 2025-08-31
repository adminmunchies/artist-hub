import { SITE_URL } from "@/lib/site"

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")

  const website = {
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

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Munchies Art Club",
    "url": base,
    "logo": `${base}/publisher-logo.svg`
  }

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <link rel="alternate" type="application/rss+xml" title="Munchies Art Club — RSS" href={`${base}/rss.xml`} />
      {children}
    </>
  )
}
