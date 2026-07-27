import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trail, Item, TitleAlign, Association, AssociationType, AssociationTargetType } from '../../types';
import { bridgeTie } from '../../associations';
import { lastItemStorageKey } from '../../editor-utils';
import {
  getProject,
  renameProject,
  createTrail,
  renameTrail,
  setTrailDescription,
  deleteTrail as deleteTrailRequest,
  createItem,
  createLooseItem,
  deleteItem,
  renameItem,
  setItemTitleAlign,
  attachItemToTrail,
  detachItemFromTrail,
  updateStep,
  tie,
  untie,
  linkItems as linkItemsRequest,
  setProjectThumbnail,
  type ProjectVisibility,
} from '@/lib/projects-store';
import { getItemContent } from '@/lib/item-content-client';
import { getMyProfile } from '@/lib/profile';
import { uploadImage } from '@/lib/upload-image';

export interface IncomingStep {
  trailId: string;
  itemId: string;
  trailTitle: string;
  annotation: string | null;
  associationType: AssociationType | null;
  connectionTitle: string | null;
}

export interface ThumbnailCapturePayload {
  title: string;
  titleAlign: TitleAlign;
  content: string;
}

// All project/trail/item state, its load/persist effects, and every CRUD
// handler the editor page needs. Deliberately excludes Lexical auto-save
// (see useAutoSave) and pure header-only UI state (title-edit input state
// lives in EditorHeader).
export function useProjectEditorState(projectId: string) {
  const router = useRouter();

  const authRedirectedRef = useRef(false);
  const redirectToLogin = useCallback(() => {
    if (authRedirectedRef.current) return;
    authRedirectedRef.current = true;
    router.replace('/login');
  }, [router]);

  const [loaded, setLoaded] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [visibility, setVisibility] = useState<ProjectVisibility>('private');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const [trails, setTrails] = useState<Trail[]>([]);
  const [items, setItems] = useState<Record<string, Item>>({});
  const itemsRef = useRef<Record<string, Item>>({});
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  const [activeTrailId, setActiveTrailId] = useState<string | undefined>(undefined);
  const [view, setView] = useState<'write' | 'trail' | 'graph'>('write');
  const [thumbnailCapture, setThumbnailCapture] = useState<ThumbnailCapturePayload | null>(null);
  const [profile, setProfile] = useState<{ username: string; imageUrl: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyProfile().then((p) => {
      if (!cancelled) setProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getProject(projectId).then(async (project) => {
      if (cancelled) return;
      if (!project) {
        router.replace('/projects');
        return;
      }
      setProjectTitle(project.title);
      setVisibility(project.visibility);
      setDescription(project.description);
      setTags(project.tags);
      setTrails(project.trails);
      setItems(project.items);
      setLoaded(true);

      const savedItemId = localStorage.getItem(lastItemStorageKey(projectId));
      const savedItem = savedItemId ? project.items[savedItemId] : undefined;
      const host = savedItem ? project.trails.find((t) => t.itemIds.includes(savedItem.id)) : undefined;
      setActiveTrailId((host ?? project.trails[0])?.id);
      if (!savedItem) return;

      try {
        const content = await getItemContent(savedItem.id);
        if (cancelled) return;
        setItems(prevItems => {
          const existing = prevItems[savedItem.id];
          if (!existing) return prevItems;
          return { ...prevItems, [savedItem.id]: { ...existing, content } };
        });
      } catch (err) {
        console.error(err);
      }
      if (!cancelled) setSelectedItemId(savedItem.id);
    }).catch(() => {
      if (!cancelled) redirectToLogin();
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, router, redirectToLogin]);

  useEffect(() => {
    if (!loaded) return;
    if (selectedItemId) {
      localStorage.setItem(lastItemStorageKey(projectId), selectedItemId);
    } else {
      localStorage.removeItem(lastItemStorageKey(projectId));
    }
  }, [projectId, selectedItemId, loaded]);

  const selectedItem = selectedItemId ? items[selectedItemId] : undefined;

  const activeTrail = useMemo(() => trails.find((t) => t.id === activeTrailId), [trails, activeTrailId]);

  // Resolve a step's associationId back to the association it used to get here.
  const associationById = useMemo(() => {
    const map = new Map<string, Association>();
    Object.values(items).forEach((it) => it.associations.forEach((a) => map.set(a.id, a)));
    return map;
  }, [items]);

  // The step by which the selected item was reached inside the active trail
  // (idx > 0). Drives the incoming-annotation banner in Write mode.
  const incomingStep: IncomingStep | null = useMemo(() => {
    if (!activeTrail || !selectedItemId) return null;
    const idx = activeTrail.steps.findIndex((s) => s.itemId === selectedItemId);
    if (idx <= 0) return null;
    const step = activeTrail.steps[idx];
    const prevItemId = activeTrail.steps[idx - 1].itemId;
    // Prefer the step's explicit associationId; otherwise fall back to the
    // item's own tie (instead of "deliberate jump").
    const conn = step.associationId
      ? associationById.get(step.associationId) ?? null
      : bridgeTie(items, prevItemId, selectedItemId);
    return {
      trailId: activeTrail.id,
      itemId: selectedItemId,
      trailTitle: activeTrail.title,
      annotation: step.annotation,
      associationType: conn?.type ?? null,
      connectionTitle: conn?.targetTitle ?? null,
    };
  }, [activeTrail, selectedItemId, associationById, items]);

  const handleUpdateAnnotation = async (trailId: string, itemId: string, annotation: string) => {
    const step = trails.find((t) => t.id === trailId)?.steps.find((s) => s.itemId === itemId);
    setTrails((prev) => prev.map((t) =>
      t.id === trailId
        ? { ...t, steps: t.steps.map((s) => (s.itemId === itemId ? { ...s, annotation } : s)) }
        : t
    ));
    await updateStep(trailId, itemId, { annotation, associationId: step?.associationId ?? null });
  };

  const commitItemTitle = (itemId: string, currentTitle: string, nextValue: string) => {
    const trimmed = nextValue.trim();
    if (!trimmed || trimmed === currentTitle) return;
    handleRenameItem(itemId, trimmed);
  };

  const handleSetItemTitleAlign = async (itemId: string, titleAlign: TitleAlign) => {
    setItems(prevItems => {
      const item = prevItems[itemId];
      if (!item) return prevItems;
      return { ...prevItems, [itemId]: { ...item, titleAlign } };
    });
    await setItemTitleAlign(itemId, titleAlign);
  };

  const selectItemRequestRef = useRef(0);

  const handleSelectItem = async (item: Item) => {
    setView('write');
    setActiveTrailId((prev) => {
      const current = trails.find((t) => t.id === prev);
      if (current?.itemIds.includes(item.id)) return prev;
      return trails.find((t) => t.itemIds.includes(item.id))?.id ?? prev;
    });
    const requestId = ++selectItemRequestRef.current;
    try {
      const content = await getItemContent(item.id);
      if (selectItemRequestRef.current !== requestId) return;
      setItems(prevItems => {
        const existing = prevItems[item.id];
        if (!existing) return prevItems;
        return { ...prevItems, [item.id]: { ...existing, content } };
      });
    } catch (err) {
      console.error(err);
    }
    if (selectItemRequestRef.current !== requestId) return;
    setSelectedItemId(item.id);
  };

  const handleCreateTrail = async (title: string) => {
    const newTrail = await createTrail(projectId, title);
    setTrails(prevTrails => [...prevTrails, newTrail]);
  };

  const handleCreateItem = async (trailId: string, title: string) => {
    const newItem = await createItem(trailId, title);
    setItems(prevItems => ({ ...prevItems, [newItem.id]: newItem }));
    setTrails(prevTrails => prevTrails.map(trail =>
      trail.id === trailId
        ? {
            ...trail,
            itemIds: [...trail.itemIds, newItem.id],
            steps: [...trail.steps, { itemId: newItem.id, annotation: null, associationId: null }],
          }
        : trail
    ));
    setActiveTrailId(trailId);
    setView('write');
    setSelectedItemId(newItem.id);
  };

  const handleLinkItemToTrail = async (trailId: string, itemId: string) => {
    await attachItemToTrail(trailId, itemId);
    setTrails(prevTrails => prevTrails.map(trail =>
      trail.id === trailId && !trail.itemIds.includes(itemId)
        ? {
            ...trail,
            itemIds: [...trail.itemIds, itemId],
            steps: [...trail.steps, { itemId, annotation: null, associationId: null }],
          }
        : trail
    ));
  };

  const handleUnlinkItemFromTrail = async (trailId: string, itemId: string) => {
    await detachItemFromTrail(trailId, itemId);
    const nextTrails = trails.map(trail =>
      trail.id === trailId
        ? {
            ...trail,
            itemIds: trail.itemIds.filter(id => id !== itemId),
            steps: trail.steps.filter(s => s.itemId !== itemId),
          }
        : trail
    );
    setTrails(nextTrails);
    if (!nextTrails.some(trail => trail.itemIds.includes(itemId))) {
      setItems(prev => {
        const it = prev[itemId];
        return it && !it.unfiled ? { ...prev, [itemId]: { ...it, unfiled: true } } : prev;
      });
    }
  };

  const handleCreateLooseItem = async (title: string) => {
    const newItem = await createLooseItem(projectId, title);
    setItems(prevItems => ({ ...prevItems, [newItem.id]: newItem }));
    setView('write');
    setSelectedItemId(newItem.id);
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId);
    setTrails(prevTrails => prevTrails.map(trail => ({
      ...trail,
      itemIds: trail.itemIds.filter(id => id !== itemId),
      steps: trail.steps.filter(s => s.itemId !== itemId),
    })));
    setItems(prevItems => {
      const next = { ...prevItems };
      delete next[itemId];
      return next;
    });
    if (selectedItemId === itemId) setSelectedItemId(undefined);
  };

  const handleRenameTrail = async (trailId: string, title: string) => {
    await renameTrail(trailId, title);
    setTrails(prevTrails => prevTrails.map(trail =>
      trail.id === trailId ? { ...trail, title } : trail
    ));
  };

  const handleSetTrailDescription = async (trailId: string, description: string) => {
    setTrails(prevTrails => prevTrails.map(trail =>
      trail.id === trailId ? { ...trail, description } : trail
    ));
    await setTrailDescription(trailId, description);
  };

  const handleRenameItem = async (itemId: string, title: string) => {
    await renameItem(itemId, title);
    setItems(prevItems => {
      const item = prevItems[itemId];
      if (!item) return prevItems;
      return { ...prevItems, [itemId]: { ...item, title } };
    });
  };

  const handleDeleteTrail = async (trailId: string) => {
    const target = trails.find(trail => trail.id === trailId);
    if (!target) return;

    await deleteTrailRequest(trailId);
    const remainingTrails = trails.filter(trail => trail.id !== trailId);
    setTrails(remainingTrails);
    const orphanIds = target.itemIds.filter(
      itemId => !remainingTrails.some(trail => trail.itemIds.includes(itemId))
    );
    if (orphanIds.length > 0) {
      setItems(prev => {
        const next = { ...prev };
        orphanIds.forEach(id => {
          if (next[id] && !next[id].unfiled) next[id] = { ...next[id], unfiled: true };
        });
        return next;
      });
    }
  };

  const handleLinkItems = async (itemId: string, otherItemId: string) => {
    if (itemId === otherItemId) return;
    await linkItemsRequest(itemId, otherItemId);
    setItems(prevItems => {
      const a = prevItems[itemId];
      const b = prevItems[otherItemId];
      if (!a || !b) return prevItems;
      const next = { ...prevItems };
      if (!a.linkedItemIds.includes(otherItemId)) {
        next[itemId] = { ...a, linkedItemIds: [...a.linkedItemIds, otherItemId] };
      }
      if (!b.linkedItemIds.includes(itemId)) {
        next[otherItemId] = { ...b, linkedItemIds: [...b.linkedItemIds, itemId] };
      }
      return next;
    });
  };

  const handleTie = async (itemId: string, targetId: string, targetType: AssociationTargetType, type: AssociationType) => {
    await tie(itemId, targetId, targetType, type);
    const targetTitle = targetType === 'ITEM'
      ? items[targetId]?.title ?? ''
      : trails.find((t) => t.id === targetId)?.title ?? '';
    setItems((prev) => {
      const it = prev[itemId];
      if (!it) return prev;
      const association: Association = { id: `tmp:${targetType}:${targetId}`, type, targetType, targetId, targetTitle };
      const linkedItemIds = targetType === 'ITEM' && !it.linkedItemIds.includes(targetId)
        ? [...it.linkedItemIds, targetId]
        : it.linkedItemIds;
      return { ...prev, [itemId]: { ...it, associations: [...it.associations, association], linkedItemIds } };
    });
  };

  const handleUntie = async (itemId: string, targetId: string, targetType: AssociationTargetType) => {
    await untie(itemId, targetId, targetType);
    setItems((prev) => {
      const it = prev[itemId];
      if (!it) return prev;
      return {
        ...prev,
        [itemId]: {
          ...it,
          associations: it.associations.filter((a) => !(a.targetId === targetId && a.targetType === targetType)),
          linkedItemIds: targetType === 'ITEM' ? it.linkedItemIds.filter((id) => id !== targetId) : it.linkedItemIds,
        },
      };
    });
  };

  const firstItemIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    firstItemIdRef.current = trails.flatMap(trail => trail.itemIds)[0];
  }, [trails]);

  const handleVisibilityChange = async (next: ProjectVisibility) => {
    setVisibility(next);
    if (next !== 'published') return;

    const firstItemId = firstItemIdRef.current;
    if (!firstItemId) return;

    try {
      const content = await getItemContent(firstItemId);
      if (content) setThumbnailCapture({
        title: itemsRef.current[firstItemId]?.title ?? '',
        titleAlign: itemsRef.current[firstItemId]?.titleAlign ?? 'center',
        content,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleThumbnailCaptured = useCallback(async (blob: Blob | null) => {
    setThumbnailCapture(null);
    if (!blob) return;
    try {
      const publicUrl = await uploadImage(blob, 'thumbnail');
      await setProjectThumbnail(projectId, publicUrl);
    } catch (err) {
      console.error(err);
    }
  }, [projectId]);

  // Bridges useAutoSave's flush success into the thumbnail-capture modal:
  // looks up the item's current title/titleAlign so useAutoSave itself only
  // ever needs to know an itemId + content, not item shape.
  const handleAutoSaveThumbnailDue = useCallback((itemId: string, content: string) => {
    setThumbnailCapture({
      title: itemsRef.current[itemId]?.title ?? '',
      titleAlign: itemsRef.current[itemId]?.titleAlign ?? 'center',
      content,
    });
  }, []);

  const updateItemContentLocally = useCallback((itemId: string, content: string) => {
    setItems(prevItems => {
      const item = prevItems[itemId];
      if (!item) return prevItems;
      return { ...prevItems, [itemId]: { ...item, content } };
    });
  }, []);

  const handleRenameProject = (title: string) => {
    setProjectTitle(title);
    renameProject(projectId, title);
  };

  return {
    loaded,
    projectTitle,
    visibility,
    description,
    setDescription,
    tags,
    setTags,
    profile,
    trails,
    items,
    selectedItem,
    selectedItemId,
    activeTrail,
    activeTrailId,
    view,
    setView,
    associationById,
    incomingStep,
    thumbnailCapture,
    firstItemIdRef,
    redirectToLogin,
    handleUpdateAnnotation,
    commitItemTitle,
    handleSetItemTitleAlign,
    handleSelectItem,
    handleCreateTrail,
    handleCreateItem,
    handleLinkItemToTrail,
    handleUnlinkItemFromTrail,
    handleCreateLooseItem,
    handleDeleteItem,
    handleRenameTrail,
    handleSetTrailDescription,
    handleRenameItem,
    handleDeleteTrail,
    handleLinkItems,
    handleTie,
    handleUntie,
    handleVisibilityChange,
    handleThumbnailCaptured,
    handleAutoSaveThumbnailDue,
    updateItemContentLocally,
    handleRenameProject,
  };
}
