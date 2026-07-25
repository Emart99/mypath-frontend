import { ArrowUp, Plus, X, Lightbulb, Waypoints, type LucideIcon } from "lucide-react";
import { Association, AssociationType, Item } from "./types";

export const ASSOCIATION_META: Record<AssociationType, { label: string; Icon: LucideIcon }> = {
  REQUIRES: { label: "requires", Icon: ArrowUp },
  ELABORATES: { label: "elaborates", Icon: Plus },
  CONTRADICTS: { label: "contradicts", Icon: X },
  EXAMPLE_OF: { label: "example of", Icon: Lightbulb },
  RELATED: { label: "related", Icon: Waypoints },
};

export const ASSOCIATION_TYPES = Object.keys(ASSOCIATION_META) as AssociationType[];

export const ASSOCIATION_COLOR_VAR: Record<AssociationType, string> = {
  REQUIRES: "--ed-blue",
  ELABORATES: "--ed-purple",
  CONTRADICTS: "--ed-red",
  EXAMPLE_OF: "--ed-green",
  RELATED: "--ed-orange",
};

export function bridgeTie(
  items: Record<string, Item>,
  prevItemId: string,
  itemId: string,
): Association | null {
  const own = items[itemId]?.associations ?? [];
  return (
    own.find((a) => a.targetType === "ITEM" && a.targetId === prevItemId) ??
    own[0] ??
    null
  );
}
