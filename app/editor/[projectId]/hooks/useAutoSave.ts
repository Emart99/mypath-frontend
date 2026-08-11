import { useCallback, useEffect, useRef, useState } from 'react';
import type { EditorState } from 'lexical';
import { saveItemContent } from '@/lib/item-content-client';
import { isAuthError } from '../../editor-utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveParams {
  selectedItemId: string | undefined;
  onOptimisticUpdate: (itemId: string, content: string) => void;
  redirectToLogin: () => void;
}


export function useAutoSave({
  selectedItemId,
  onOptimisticUpdate,
  redirectToLogin,
}: UseAutoSaveParams) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const pendingContentRef = useRef<{ itemId: string; content: string } | null>(null);
  const inFlightRef = useRef(0);
  const saveContentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedItemContentRef = useRef<string | null>(null);

  const handleContentApplied = useCallback((itemId: string) => {
    loadedItemContentRef.current = itemId;
  }, []);

  const flushPendingContent = useCallback(() => {
    if (saveContentTimeoutRef.current) {
      clearTimeout(saveContentTimeoutRef.current);
      saveContentTimeoutRef.current = null;
    }
    const pending = pendingContentRef.current;
    if (!pending) return;
    pendingContentRef.current = null;
    setSaveStatus('saving');
    inFlightRef.current += 1;
    saveItemContent(pending.itemId, pending.content)
      .then(() => {
        if (!pendingContentRef.current) setSaveStatus('saved');
      })
      .catch((err) => {
        console.error(err);
        setSaveStatus('error');
        if (!pendingContentRef.current) {
          pendingContentRef.current = pending;
        }
        if (isAuthError(err)) redirectToLogin();
      })
      .finally(() => {
        inFlightRef.current -= 1;
      });
  }, [redirectToLogin]);

  useEffect(() => {
    return () => flushPendingContent();
  }, [selectedItemId, flushPendingContent]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!pendingContentRef.current && inFlightRef.current === 0) return;
      flushPendingContent();
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flushPendingContent]);

  const onChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      if (!selectedItemId) return;
      if (loadedItemContentRef.current !== selectedItemId) return;
      const json = JSON.stringify(editorState.toJSON());
      onOptimisticUpdate(selectedItemId, json);
      if (json.includes('"src":"blob:')) return;

      pendingContentRef.current = { itemId: selectedItemId, content: json };
      setSaveStatus('saving');
      if (saveContentTimeoutRef.current) clearTimeout(saveContentTimeoutRef.current);
      saveContentTimeoutRef.current = setTimeout(() => flushPendingContent(), 600);
    });
  }, [selectedItemId, flushPendingContent, onOptimisticUpdate]);

  return { saveStatus, onChange, handleContentApplied };
}
