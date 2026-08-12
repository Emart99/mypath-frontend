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

export interface BridgeTie {
  association: Association;
  forward: boolean;
}

export function bridgeTies(
  items: Record<string, Item>,
  prevItemId: string,
  itemId: string,
): BridgeTie[] {
  const ties: BridgeTie[] = [];
  const forward = (items[itemId]?.associations ?? []).find(
    (a) => a.targetType === "ITEM" && a.targetId === prevItemId,
  );
  if (forward) ties.push({ association: forward, forward: true });
  const backward = (items[prevItemId]?.associations ?? []).find(
    (a) => a.targetType === "ITEM" && a.targetId === itemId,
  );
  if (backward) ties.push({ association: backward, forward: false });
  return ties;
}
