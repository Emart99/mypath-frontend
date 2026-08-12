import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trail, Item, TitleAlign, Association, AssociationType, AssociationTargetType } from '../../types';
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
  reorderTrailItems,
  tie,
  untie,
  type ProjectVisibility,
} from '@/lib/projects-store';
import { getItemContent, getTrailContents } from '@/lib/item-content-client';
import { getMyProfile } from '@/lib/profile';
import type { GraphPreviewData } from '@/lib/feed';

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
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null);
  const [thumbnailGraph, setThumbnailGraph] = useState<GraphPreviewData | null>(null);

  const [trails, setTrails] = useState<Trail[]>([]);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  const [activeTrailId, setActiveTrailId] = useState<string | undefined>(undefined);
  const [view, setView] = useState<'write' | 'overview' | 'graph'>('write');
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
      setThumbnailImageUrl(project.thumbnailImageUrl);
      setThumbnailGraph(project.thumbnailGraph);
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

  const associationById = useMemo(() => {
    const map = new Map<string, Association>();
    Object.values(items).forEach((it) => it.associations.forEach((a) => map.set(a.id, a)));
    return map;
  }, [items]);

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
  const trailContentRequestRef = useRef(0);
  const [loadedContentTrailId, setLoadedContentTrailId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!activeTrailId) return;
    const requestId = ++trailContentRequestRef.current;
    getTrailContents(activeTrailId)
      .then((byId) => {
        if (trailContentRequestRef.current !== requestId) return;
        setItems((prevItems) => {
          let changed = false;
          const next = { ...prevItems };
          for (const [itemId, content] of Object.entries(byId)) {
            const existing = next[itemId];
            if (!existing || existing.content != null) continue;
            next[itemId] = { ...existing, content };
            changed = true;
          }
          return changed ? next : prevItems;
        });
        setLoadedContentTrailId(activeTrailId);
      })
      .catch((err) => console.error(err));
  }, [activeTrailId]);

  const handleSelectItem = async (item: Item) => {
    setView('write');
    setActiveTrailId((prev) => {
      const current = trails.find((t) => t.id === prev);
      if (current?.itemIds.includes(item.id)) return prev;
      return trails.find((t) => t.itemIds.includes(item.id))?.id ?? prev;
    });
    if (items[item.id]?.content != null) setSelectedItemId(item.id);
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

  const handleReorderTrailItems = async (trailId: string, itemIds: string[]) => {
    const previous = trails.find((trail) => trail.id === trailId);
    if (!previous) return;
    setTrails((prev) => prev.map((trail) => {
      if (trail.id !== trailId) return trail;
      const stepByItemId = new Map(trail.steps.map((step) => [step.itemId, step]));
      const steps = itemIds.flatMap((itemId) => {
        const step = stepByItemId.get(itemId);
        return step ? [step] : [];
      });
      if (steps.length !== trail.steps.length) return trail;
      return { ...trail, itemIds, steps };
    }));
    try {
      await reorderTrailItems(trailId, itemIds);
    } catch (err) {
      console.error(err);
      setTrails((prev) => prev.map((trail) =>
        trail.id === trailId ? { ...trail, itemIds: previous.itemIds, steps: previous.steps } : trail
      ));
    }
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

  const handleTie = async (itemId: string, targetId: string, targetType: AssociationTargetType, type: AssociationType) => {
    await tie(itemId, targetId, targetType, type);
    const targetTitle = targetType === 'ITEM'
      ? items[targetId]?.title ?? ''
      : trails.find((t) => t.id === targetId)?.title ?? '';
    setItems((prev) => {
      const it = prev[itemId];
      if (!it) return prev;
      if (it.associations.some((a) => a.targetType === targetType && a.targetId === targetId)) {
        return prev;
      }
      const association: Association = { id: `tmp:${type}:${targetType}:${targetId}`, type, targetType, targetId, targetTitle };
      const linkedItemIds = targetType === 'ITEM' && !it.linkedItemIds.includes(targetId)
        ? [...it.linkedItemIds, targetId]
        : it.linkedItemIds;
      return { ...prev, [itemId]: { ...it, associations: [...it.associations, association], linkedItemIds } };
    });
  };

  const handleLinkItems = async (itemId: string, otherItemId: string) => {
    if (itemId === otherItemId) return;
    await handleTie(itemId, otherItemId, 'ITEM', 'RELATED');
    setItems((prev) => {
      const other = prev[otherItemId];
      if (!other || other.linkedItemIds.includes(itemId)) return prev;
      return { ...prev, [otherItemId]: { ...other, linkedItemIds: [...other.linkedItemIds, itemId] } };
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

  const handleVisibilityChange = async (next: ProjectVisibility) => {
    setVisibility(next);
  };

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

  const handleThumbnailChange = useCallback((imageUrl: string | null, graph: GraphPreviewData | null) => {
    setThumbnailImageUrl(imageUrl);
    setThumbnailGraph(graph);
  }, []);

  return {
    loaded,
    projectTitle,
    visibility,
    description,
    setDescription,
    tags,
    setTags,
    thumbnailImageUrl,
    thumbnailGraph,
    handleThumbnailChange,
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
    loadedContentTrailId,
    redirectToLogin,
    handleUpdateAnnotation,
    commitItemTitle,
    handleSetItemTitleAlign,
    handleSelectItem,
    handleReorderTrailItems,
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
    updateItemContentLocally,
    handleRenameProject,
  };
}
