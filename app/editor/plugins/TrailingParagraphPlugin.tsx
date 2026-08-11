"use client"

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
} from 'lexical';

function $appendTrailingParagraph(): boolean {
  const root = $getRoot();
  const last = root.getLastChild();
  if ($isParagraphNode(last) && last.isEmpty()) {
    last.select();
    return false;
  }
  const paragraph = $createParagraphNode();
  root.append(paragraph);
  paragraph.select();
  return true;
}

function getCaretRect(): DOMRect | null {
  const domSelection = window.getSelection();
  if (domSelection === null || domSelection.rangeCount === 0) return null;
  const range = domSelection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.height > 0) return rect;
  const clientRects = range.getClientRects();
  if (clientRects.length > 0) return clientRects[0];
  const container = range.startContainer;
  const element =
    container.nodeType === Node.ELEMENT_NODE ? (container as Element) : container.parentElement;
  return element?.getBoundingClientRect() ?? null;
}

export default function TrailingParagraphPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          if (event.target !== editor.getRootElement()) return false;
          return $appendTrailingParagraph();
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;

          const block = selection.anchor.getNode().getTopLevelElement();
          if (block === null || block !== $getRoot().getLastChild()) return false;

          const blockElement = editor.getElementByKey(block.getKey());
          if (blockElement === null) return false;

          const caretRect = getCaretRect();
          if (caretRect === null) return false;

          const blockRect = blockElement.getBoundingClientRect();
          if (blockRect.bottom - caretRect.bottom >= caretRect.height) return false;

          event.preventDefault();
          return $appendTrailingParagraph();
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  return null;
}
