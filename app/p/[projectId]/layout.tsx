import { SidebarProvider } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="contents">
      <SidebarProvider
        style={{ "--sidebar-width": "288px" } as React.CSSProperties}
        className="h-screen min-h-0"
      >
        {children}
      </SidebarProvider>
    </div>
  )
}
