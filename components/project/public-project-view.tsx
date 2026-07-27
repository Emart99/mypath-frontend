"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Eye, FolderPlus, ListTree, MessageCircle, Route } from "lucide-react"

import { PublicSidebar } from "@/components/project/public-sidebar"
import { LexicalReadOnly } from "@/components/project/lexical-read-only"
import { ProjectShell } from "@/components/editor/project-shell"
import { GraphView } from "@/components/editor/graph-view"
import { TrailView } from "@/components/editor/trail-view"
import { VoteButton } from "@/components/social/vote-button"
import { ForkButton } from "@/components/social/fork-button"
import { BookmarkButton } from "@/components/social/bookmark-button"
import { AuthPromptActions } from "@/components/auth/auth-prompt-actions"
import { ReportButton } from "@/components/social/report-button"
import { ShareToFollowersButton } from "@/components/social/share-to-followers-button"
import { CommentsSection } from "@/components/project/comments-section"
import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"
import type { PublicItem, PublicProject } from "@/lib/public-project"
import type { Association, Item, Trail } from "@/app/editor/types"

function toEditorShape(project: PublicProject): { trails: Trail[]; items: Record<string, Item> } {
  const items: Record<string, Item> = {};
  const trails: Trail[] = project.trails.map((trail) => {
    trail.items.forEach((item) => {
      items[item.id] = {
        id: item.id,
        title: item.title,
        titleAlign: item.titleAlign,
        unfiled: false,
        content: item.content,
        associations: item.associations,
        linkedItemIds: item.associations.filter((a) => a.targetType === "ITEM").map((a) => a.targetId),
      };
    });
    return {
      id: trail.id,
      title: trail.title,
      description: trail.description,
      itemIds: trail.items.map((item) => item.id),
      steps: trail.items.map((item) => ({
        itemId: item.id,
        annotation: item.annotation,
        associationId: item.associationId,
      })),
      version: trail.version,
      forkedFrom: trail.forkedFromId,
    };
  });
  return { trails, items };
}

export function PublicProjectView({
  project,
  homeHref,
  isLoggedIn,
  isOwnProject,
  username,
  imageUrl,
}: {
  project: PublicProject
  homeHref: string
  isLoggedIn: boolean
  isOwnProject: boolean
  username: string | null
  imageUrl: string | null
}) {
  const allItems = project.trails.flatMap((trail) => trail.items)
  const [selectedItem, setSelectedItem] = useState<PublicItem | undefined>(allItems[0])
  const [activeTrailId, setActiveTrailId] = useState<string | undefined>(project.trails[0]?.id)
  const [view, setView] = useState<'content' | 'trail' | 'graph'>('content')

  const { trails, items } = useMemo(() => toEditorShape(project), [project])

  const activeTrail = useMemo(() => trails.find((t) => t.id === activeTrailId), [trails, activeTrailId])

  const associationById = useMemo(() => {
    const map = new Map<string, Association>();
    Object.values(items).forEach((it) => it.associations.forEach((a) => map.set(a.id, a)));
    return map;
  }, [items])

  const handleSelectItem = (item: PublicItem) => {
    setSelectedItem(item)
    setView('content')
    setActiveTrailId((prev) => {
      const current = trails.find((t) => t.id === prev)
      if (current?.itemIds.includes(item.id)) return prev
      return trails.find((t) => t.itemIds.includes(item.id))?.id ?? prev
    })
  }

  const handleSelectMappedItem = (item: Item) => {
    const original = allItems.find((candidate) => candidate.id === item.id)
    if (original) handleSelectItem(original)
  }

  const handleItemLinkClick = (itemId: string) => {
    const item = allItems.find((candidate) => candidate.id === itemId)
    if (item) handleSelectItem(item)
  }

  const emptyState = (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-popover text-center text-muted-foreground">
      <FolderPlus className="h-12 w-12 opacity-40" />
      <p className="text-lg font-medium">This project has no published content yet</p>
    </div>
  )

  return (
    <ProjectShell
      homeHref={homeHref}
      titleSlot={
        <div className="flex min-w-0 items-center gap-3">
          <span className="min-w-0 truncate text-[15px] font-medium">{project.title}</span>
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
            by{" "}
            <Link href={`/u/${encodeURIComponent(project.ownerUsername)}`} className="font-medium hover:text-primary">
              {project.ownerUsername}
            </Link>
          </span>
          <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
            <Eye className="h-3.5 w-3.5" />
            {project.viewCount} views
          </span>
        </div>
      }
      actions={
        <>
          {view === 'content' && (
            <a
              href="#comments"
              title="Jump to comments"
              className="relative z-10 flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4" />
              {project.commentCount}
            </a>
          )}
          {allItems.length > 0 && (
            <Button
              variant={view === 'graph' ? 'secondary' : 'ghost'}
              size="lg"
              onClick={() => setView((v) => (v === 'graph' ? 'content' : 'graph'))}
              title="See this project as a graph"
            >
              <ListTree className="h-[15px] w-[15px]" />
              Graph
            </Button>
          )}
          {activeTrail && (
            <Button
              variant={view === 'trail' ? 'secondary' : 'ghost'}
              size="lg"
              onClick={() => setView((v) => (v === 'trail' ? 'content' : 'trail'))}
              title="Read this trail as a narrated sequence"
            >
              <Route className="h-[15px] w-[15px]" />
              Trail
            </Button>
          )}
          {isLoggedIn ? (
            <>
              {!isOwnProject && <ReportButton projectId={project.id} isLoggedIn={isLoggedIn} />}
              {!isOwnProject && <ForkButton projectId={project.id} isLoggedIn={isLoggedIn} />}
              <ShareToFollowersButton projectId={project.id} isLoggedIn={isLoggedIn} />
              <BookmarkButton
                projectId={project.id}
                initialBookmarked={project.bookmarkedByRequester}
                isLoggedIn={isLoggedIn}
              />
              <VoteButton
                projectId={project.id}
                initialVoted={project.votedByRequester}
                initialCount={project.voteCount}
                isLoggedIn={isLoggedIn}
              />
            </>
          ) : (
            <AuthPromptActions />
          )}
          {isLoggedIn && <UserMenu loggedIn={isLoggedIn} username={username} imageUrl={imageUrl} />}
        </>
      }
      sidebar={
        <PublicSidebar
          trails={project.trails}
          selectedItemId={selectedItem?.id}
          onSelectItem={handleSelectItem}
        />
      }
      content={
        <div className="flex min-w-0 flex-1 gap-3 overflow-hidden">
          {view === 'graph' ? (
            <GraphView
              trails={trails}
              items={items}
              activeTrailId={activeTrailId}
              selectedItemId={selectedItem?.id}
              onSelectItem={handleSelectMappedItem}
              onClose={() => setView('content')}
            />
          ) : view === 'trail' ? (
            <TrailView
              trail={activeTrail}
              items={items}
              associationById={associationById}
              selectedItemId={selectedItem?.id}
              onSelectItem={handleSelectMappedItem}
              onClose={() => setView('content')}
              emptyState={emptyState}
            />
          ) : (
            <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-auto">
              {selectedItem ? (
                <div className="rounded-2xl bg-popover">
                  <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4 px-6 py-8">
                    <h1 className="font-display text-[28px] font-medium" style={{ textAlign: selectedItem.titleAlign }}>
                      {selectedItem.title}
                    </h1>
                    <LexicalReadOnly key={selectedItem.id} content={selectedItem.content} onItemClick={handleItemLinkClick} />
                  </div>
                </div>
              ) : emptyState}
              <div className="rounded-2xl bg-popover">
                <CommentsSection projectId={project.id} isLoggedIn={isLoggedIn} commentCount={project.commentCount} />
              </div>
            </div>
          )}
        </div>
      }
    />
  )
}
