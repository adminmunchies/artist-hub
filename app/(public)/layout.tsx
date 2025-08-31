import type { ReactNode } from "react"
import SiteNav from "@/app/_components/SiteNav"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
    </>
  )
}
