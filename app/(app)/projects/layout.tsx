import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Projects",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="contents">{children}</div>
}
