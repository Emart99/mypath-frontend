import { useCallback, useEffect, useRef, useState } from 'react';
import type { EditorState } from 'lexical';
import { saveItemContent } from '@/lib/item-content-client';
import { isAuthError } from '../../editor-utils';

const THUMBNAIL_RECAPTURE_INTERVAL_MS = 10000;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveParams {
  selectedItemId: string | undefined;
  firstItemIdRef: React.RefObject<string | undefined>;
  onOptimisticUpdate: (itemId: string, content: string) => void;
  onThumbnailDue: (itemId: string, content: string) => void;
  redirectToLogin: () => void;
}


export function useAutoSave({
  selectedItemId,
  firstItemIdRef,
  onOptimisticUpdate,
  onThumbnailDue,
  redirectToLogin,
}: UseAutoSaveParams) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const pendingContentRef = useRef<{ itemId: string; content: string } | null>(null);
  const saveContentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastThumbnailCaptureRef = useRef(0);
  const loadedItemContentRef = useRef<string | null>(null);

  const handleContentApplied = useCallback((itemId: string) => {
    loadedItemContentRef.current = itemId;
  }, []);

  const flushPendingContent = useCallback((captureThumbnail: boolean) => {
    if (saveContentTimeoutRef.current) {
      clearTimeout(saveContentTimeoutRef.current);
      saveContentTimeoutRef.current = null;
    }
    const pending = pendingContentRef.current;
    if (!pending) return;
    pendingContentRef.current = null;
    setSaveStatus('saving');
    saveItemContent(pending.itemId, pending.content)
      .then(() => {
        setSaveStatus('saved');
        if (captureThumbnail && pending.itemId === firstItemIdRef.current) {
          lastThumbnailCaptureRef.current = Date.now();
          onThumbnailDue(pending.itemId, pending.content);
        }
      })
      .catch((err) => {
        console.error(err);
        setSaveStatus('error');
        if (!pendingContentRef.current) {
          pendingContentRef.current = pending;
        }
        if (isAuthError(err)) redirectToLogin();
      });
  }, [firstItemIdRef, onThumbnailDue, redirectToLogin]);

  useEffect(() => {
    return () => flushPendingContent(true);
  }, [selectedItemId, flushPendingContent]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!pendingContentRef.current) return;
      flushPendingContent(false);
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

      pendingContentRef.current = { itemId: selectedItemId, content: json };
      setSaveStatus('saving');
      if (saveContentTimeoutRef.current) clearTimeout(saveContentTimeoutRef.current);
      const dueForThumbnailRecapture = Date.now() - lastThumbnailCaptureRef.current > THUMBNAIL_RECAPTURE_INTERVAL_MS;
      saveContentTimeoutRef.current = setTimeout(() => flushPendingContent(dueForThumbnailRecapture), 600);
    });
  }, [selectedItemId, flushPendingContent, onOptimisticUpdate]);

  return { saveStatus, onChange, handleContentApplied };
}
