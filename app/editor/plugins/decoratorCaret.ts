import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  LexicalNode,
} from 'lexical';

export type Edge = 'before' | 'after';

export function $caretTouches(node: LexicalNode, edge: Edge): boolean {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;
  const point = selection.anchor;
  const anchorNode = point.getNode();
  const sibling = edge === 'after' ? 'getPreviousSibling' : 'getNextSibling';

  if (point.type === 'text') {
    const atEdge = edge === 'after' ? point.offset === 0 : point.offset === anchorNode.getTextContentSize();
    if (!atEdge) return false;
    if (anchorNode[sibling]() === node) return true;
    const block = anchorNode.getTopLevelElement();
    return anchorNode[sibling]() === null && block !== null && block[sibling]() === node;
  }

  if (!$isElementNode(anchorNode)) return false;
  const neighbour = edge === 'after'
    ? anchorNode.getChildAtIndex(point.offset - 1)
    : anchorNode.getChildAtIndex(point.offset);
  if (neighbour === node) return true;
  const empty = anchorNode.getChildrenSize() === 0;
  return empty && anchorNode[sibling]() === node;
}
