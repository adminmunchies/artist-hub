import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  // sorgt dafür, dass relative URLs (z.B. /api/og/news) korrekt aufgelöst werden
  metadataBase: new URL((SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")),
  robots: { maxImagePreview: "large" },
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
