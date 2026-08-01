"use client"

import type { Item, Trail } from "@/app/editor/types"
import type { GraphPreviewData } from "@/lib/feed"
import { KnowledgeGraph } from "@/components/editor/knowledge-graph"
import { initial } from "@/components/shared/author-avatar"

function toGraphProps(graph: GraphPreviewData): { trails: Trail[]; items: Record<string, Item> } {
  const trail: Trail = {
    id: graph.trailId,
    title: graph.trailTitle,
    description: "",
    itemIds: graph.itemIds,
    steps: [],
    version: 1,
    forkedFrom: null,
  }
  const items: Record<string, Item> = {}
  for (const item of graph.items) {
    items[item.id] = {
      id: item.id,
      title: item.title,
      titleAlign: "center",
      unfiled: false,
      content: null,
      associations: item.associations,
      linkedItemIds: item.associations.filter((a) => a.targetType === "ITEM").map((a) => a.targetId),
    }
  }
  return { trails: [trail], items }
}

export function ProjectThumbnail({
  thumbnailImageUrl,
  thumbnailGraph,
  title,
  className = "",
  placeholder,
}: {
  thumbnailImageUrl: string | null;
  thumbnailGraph: GraphPreviewData | null;
  title: string;
  // Sizing + background — background only shows behind the placeholder/graph branches
  // (an <img> with object-cover fills the box), so pass it here regardless.
  className?: string;
  // Defaults to a letter-initial badge; pass a custom node (e.g. an icon) to override.
  placeholder?: React.ReactNode;
}) {
  if (thumbnailImageUrl) {
    return (
      <div className={`overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbnailImageUrl} alt="" className="h-full w-full object-cover object-top" />
      </div>
    )
  }
  if (thumbnailGraph) {
    const { trails, items } = toGraphProps(thumbnailGraph)
    return (
      <div className={`overflow-hidden ${className}`}>
        <KnowledgeGraph trails={trails} items={items} onSelectItem={() => {}} variant="preview" />
      </div>
    )
  }
  return (
    <div className={`grid place-items-center overflow-hidden ${className}`}>
      {placeholder ?? <span className="font-display text-2xl font-medium text-primary">{initial(title)}</span>}
    </div>
  )
}
