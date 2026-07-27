"use client"

import { useState } from "react"
import { ChevronRight, Search } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import type { PublicItem, PublicTrail } from "@/lib/public-project"

interface PublicSidebarProps {
  trails: PublicTrail[];
  selectedItemId?: string;
  onSelectItem: (item: PublicItem) => void;
}

export function PublicSidebar({ trails, selectedItemId, onSelectItem }: PublicSidebarProps) {
  const { state } = useSidebar();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visibleTrails = q
    ? trails.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.items.some((item) => item.title.toLowerCase().includes(q))
      )
    : trails;

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r">
      <SidebarContent className="gap-0.5">
        {state !== "collapsed" && (
          <div className="px-2.5 pt-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                placeholder="Search this project"
                className="h-8 pl-8 rounded-full"
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="text-xs font-medium text-muted-foreground">
              Trails
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleTrails.map((trail) => (
                <Collapsible key={trail.id} defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="font-semibold">
                        <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        <span>{trail.title}</span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {trail.items.map((item) => (
                          <SidebarMenuSubItem key={item.id}>
                            <SidebarMenuSubButton
                              isActive={selectedItemId === item.id}
                              onClick={() => onSelectItem(item)}
                            >
                              <span
                                className={
                                  selectedItemId === item.id
                                    ? "h-[7px] w-[7px] shrink-0 rounded-full bg-primary"
                                    : "h-[7px] w-[7px] shrink-0 rounded-full border-[1.5px] border-muted-foreground box-border"
                                }
                              />
                              <span className="truncate">{item.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
