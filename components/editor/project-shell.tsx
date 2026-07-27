import Link from "next/link"
import { Mark } from "@/components/layout/logo"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export function ProjectShell({
  homeHref,
  showLogo = true,
  titleSlot,
  actions,
  sidebar,
  content,
}: {
  homeHref: string
  // The editor view moves the brand mark into its sidebar (next to the search
  // box), so the navbar shouldn't show it twice.
  showLogo?: boolean
  titleSlot: React.ReactNode
  actions?: React.ReactNode
  sidebar: React.ReactNode
  content: React.ReactNode
}) {
  return (
    <>
      {sidebar}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 px-4 md:px-8">
          <SidebarTrigger className="md:hidden" />
          {showLogo && (
            <>
              <Link href={homeHref} title="Back to projects">
                <Mark />
              </Link>
              <span className="h-[18px] w-px bg-border shrink-0" />
            </>
          )}
          <div className="min-w-0 flex-1">{titleSlot}</div>
          <div className="ml-auto flex shrink-0 items-center gap-3 overflow-x-auto">
            {actions}
          </div>
        </header>
        <div className="flex flex-1 min-h-0 gap-3 px-3">
          {content}
        </div>
      </SidebarInset>
    </>
  )
}
