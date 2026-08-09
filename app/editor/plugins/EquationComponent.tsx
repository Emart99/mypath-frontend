"use client"

import * as React from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isTextNode,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  LexicalEditor,
  NodeKey,
} from 'lexical';
import katex from 'katex';
import { $isEquationNode } from '../nodes/EquationNode';
import { freshlyInserted } from './EquationsPlugin';

interface EquationComponentProps {
  equation: string;
  inline: boolean;
  nodeKey: NodeKey;
}

function renderKatex(target: HTMLElement, equation: string, inline: boolean): string | null {
  try {
    katex.render(equation, target, {
      displayMode: !inline,
      throwOnError: true,
      trust: false,
      strict: 'warn',
      output: 'html',
    });
    return null;
  } catch (parseError) {
    katex.render(equation, target, {
      displayMode: !inline,
      throwOnError: false,
      trust: false,
      strict: 'warn',
      output: 'html',
    });
    return String((parseError as Error).message).replace(/^KaTeX parse error:\s*/, '');
  }
}

function returnFocusAfter(editor: LexicalEditor, nodeKey: NodeKey) {
  requestAnimationFrame(() => {
    editor.getRootElement()?.focus({ preventScroll: true });
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isEquationNode(node)) return;
      if (node.isInline()) {
        const after = node.getNextSibling();
        if ($isTextNode(after)) {
          after.select(0, 0);
        } else {
          const caret = $createTextNode('');
          node.insertAfter(caret);
          caret.select();
        }
        return;
      }
      const block = node.getTopLevelElement() ?? node;
      let next = block.getNextSibling();
      if (next === null) {
        next = $createParagraphNode();
        block.insertAfter(next);
      }
      next.selectStart();
    });
    editor.focus(undefined, { defaultSelection: 'rootEnd' });
  });
}

export default function EquationComponent({
  equation,
  inline,
  nodeKey,
}: EquationComponentProps) {
  const [editor] = useLexicalComposerContext();
  const isEditable = editor.isEditable();
  const [isSelected, setSelected, clearSelected] = useLexicalNodeSelection(nodeKey);
  const [isEditing, setIsEditing] = useState(() => freshlyInserted.delete(nodeKey));
  const [draft, setDraft] = useState(equation);
  const [error, setError] = useState<string | null>(null);
  const katexRef = useRef<HTMLSpanElement | null>(null);
  const previewRef = useRef<HTMLSpanElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const discardedOnMount = useRef(false);
  useEffect(() => {
    if (discardedOnMount.current) return;
    discardedOnMount.current = true;
    if (!isEditable || isEditing || equation !== '') return;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isEquationNode(node)) node.remove();
    });
  }, [editor, equation, isEditable, isEditing, nodeKey]);

  useEffect(() => {
    if (isEditing || katexRef.current === null) return;
    renderKatex(katexRef.current, equation, inline);
  }, [equation, inline, isEditing]);

  useLayoutEffect(() => {
    if (!isEditing || previewRef.current === null) return;
    setError(renderKatex(previewRef.current, draft || '\\;', inline));
  }, [draft, inline, isEditing]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!isEditing || textarea === null) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [isEditing]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!isEditing || textarea === null) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [draft, isEditing]);

  const pendingFocus = useRef(false);

  useEffect(() => {
    if (isEditing || !pendingFocus.current) return;
    pendingFocus.current = false;
    returnFocusAfter(editor, nodeKey);
  }, [editor, isEditing, nodeKey]);

  const commit = useCallback(() => {
    const next = draft.trim();
    if (next === '') {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) node.remove();
      });
      setIsEditing(false);
      return;
    }
    if (next !== equation) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) node.setEquation(next);
      });
    }
    pendingFocus.current = true;
    setIsEditing(false);
  }, [draft, editor, equation, nodeKey]);

  const cancel = useCallback(() => {
    setDraft(equation);
    if (equation === '') {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) node.remove();
      });
      setIsEditing(false);
      return;
    }
    pendingFocus.current = true;
    setIsEditing(false);
  }, [editor, equation, nodeKey]);

  const startEditing = useCallback(() => {
    if (!isEditable) return;
    setDraft(equation);
    setIsEditing(true);
  }, [equation, isEditable]);

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) {
          node.remove();
        }
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  useEffect(() => {
    if (!isEditable || isEditing) return;
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          if (katexRef.current !== null && katexRef.current.contains(event.target as Node)) {
            if (event.detail >= 2) {
              startEditing();
              return true;
            }
            if (inline) return false;
            clearSelected();
            setSelected(true);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
    );
  }, [clearSelected, editor, inline, isEditable, isEditing, onDelete, setSelected, startEditing]);

  if (isEditing && isEditable) {
    return (
      <span
        key="editing"
        className={inline ? 'editor-equation-editor inline' : 'editor-equation-editor'}
      >
        <textarea
          ref={textareaRef}
          className="editor-equation-input"
          value={draft}
          rows={1}
          spellCheck={false}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              commit();
            } else if (event.key === 'Escape') {
              event.preventDefault();
              cancel();
            }
          }}
          placeholder={inline ? 'a + b' : '\\frac{a}{b}'}
          aria-label="LaTeX equation"
        />
        <span className="editor-equation-preview" ref={previewRef} aria-hidden />
        {error !== null && <span className="editor-equation-error">{error}</span>}
      </span>
    );
  }

  return (
    <span
      key="rendered"
      ref={katexRef}
      className={isSelected ? 'editor-equation-rendered selected' : 'editor-equation-rendered'}
      onDoubleClick={startEditing}
    />
  );
}
