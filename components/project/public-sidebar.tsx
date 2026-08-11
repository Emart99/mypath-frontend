"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"

import { Mark } from "@/components/layout/logo"
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
import { MIN_SEARCH_LENGTH, searchableText } from "@/app/editor/editor-utils"

interface PublicSidebarProps {
  homeHref: string;
  trails: PublicTrail[];
  looseItems: PublicItem[];
  selectedItemId?: string;
  onSelectItem: (item: PublicItem) => void;
}

export function PublicSidebar({ homeHref, trails, looseItems, selectedItemId, onSelectItem }: PublicSidebarProps) {
  const { state } = useSidebar();
  const [query, setQuery] = useState("");

  const bodies = useMemo(
    () =>
      new Map(
        [...looseItems, ...trails.flatMap((t) => t.items)].map((item) => [
          item.id,
          searchableText(item.content),
        ])
      ),
    [trails, looseItems]
  );

  const q = query.trim().toLowerCase();
  const matches = (item: PublicItem) =>
    item.title.toLowerCase().includes(q) ||
    (q.length >= MIN_SEARCH_LENGTH && (bodies.get(item.id)?.includes(q) ?? false));

  const visibleTrails = q
    ? trails.filter((t) => t.title.toLowerCase().includes(q) || t.items.some(matches))
    : trails;
  const visibleLooseItems = q ? looseItems.filter(matches) : looseItems;

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r">
      <SidebarContent className="gap-0.5">
        {state !== "collapsed" && (
          <div className="flex items-center gap-2 px-2.5 pt-4">
            <Link href={homeHref} title="Back to projects" className="shrink-0">
              <Mark size={26} />
            </Link>
            <div className="relative flex-1">
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
        {visibleLooseItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <span className="text-xs font-medium text-muted-foreground">
                Items
              </span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleLooseItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
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
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
