"use client"

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent } from '@lexical/utils';
import { $isListItemNode } from '@lexical/list';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  INDENT_CONTENT_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';

// TabIndentationPlugin only indents when the caret sits at the very start of a block and inserts
// a literal tab otherwise, which is fine for paragraphs but surprising inside a list: every other
// editor nests the item wherever the caret happens to be. Runs at HIGH so it wins over
// TabIndentationPlugin (registered at COMMAND_PRIORITY_EDITOR) and only claims the event when the
// selection is actually inside a list item, leaving paragraph tabs untouched.
export default function ListTabPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<KeyboardEvent>(
      KEY_TAB_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        const listItem = $findMatchingParent(selection.anchor.getNode(), $isListItemNode);
        if (listItem === null) return false;
        event.preventDefault();
        editor.dispatchCommand(
          event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
          undefined,
        );
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
