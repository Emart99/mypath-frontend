import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SidebarCustom } from "@/components/sidebar-custom"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarCustom />
      <main className="w-full">
        {/* <SidebarTrigger /> */}
        {children}
      </main>
    </SidebarProvider>
  )
}