import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    maxImagePreview: "large",
  },
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
