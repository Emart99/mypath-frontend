import { ChevronRight, FileText, Folder } from "lucide-react"

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
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Path, Idea } from "@/app/dashboard/types"

interface SidebarCustomProps {
  paths: Path[];
  selectedIdeaId?: string;
  onSelectIdea: (idea: Idea) => void;
}

export function SidebarCustom({ paths, selectedIdeaId, onSelectIdea }: SidebarCustomProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My Paths</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {paths.map((path) => (
                <Collapsible key={path.id} defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Folder />
                        <span>{path.title}</span>
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {path.ideas.map((idea) => (
                          <SidebarMenuSubItem key={idea.id}>
                            <SidebarMenuSubButton
                              isActive={selectedIdeaId === idea.id}
                              onClick={() => onSelectIdea(idea)}
                            >
                              <FileText className="mr-2" />
                              <span>{idea.title}</span>
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
  );
}