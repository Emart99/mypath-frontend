import { $getSelection, $isRangeSelection } from 'lexical';
import { $isCodeNode } from '@lexical/code';

export function $isSelectionInCode(): boolean {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return false;
  return $isCodeNode(selection.anchor.getNode().getTopLevelElement());
}
