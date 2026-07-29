import { useState } from 'react';
import { AlertCircle, Check, Loader2, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserMenu } from '@/components/layout/user-menu';
import { ShareDialog } from '@/components/editor/share-dialog';
import { VersionHistorySheet } from '@/components/editor/version-history-sheet';
import type { ProjectVisibility } from '@/lib/projects-store';
import type { SaveStatus } from '../hooks/useAutoSave';

interface EditorTitleSlotProps {
  projectTitle: string;
  onRenameProject: (title: string) => void;
  saveStatus: SaveStatus;
}

// Double-click-to-rename project title, plus the save-status indicator.
export function EditorTitleSlot({ projectTitle, onRenameProject, saveStatus }: EditorTitleSlotProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState('');

  const startEditTitle = () => {
    setEditingTitleValue(projectTitle);
    setIsEditingTitle(true);
  };

  const submitEditTitle = () => {
    const title = editingTitleValue.trim();
    setIsEditingTitle(false);
    if (!title || title === projectTitle) return;
    onRenameProject(title);
  };

  if (isEditingTitle) {
    return (
      <Input
        autoFocus
        value={editingTitleValue}
        className="h-8 max-w-xs"
        onChange={(e) => setEditingTitleValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submitEditTitle();
          if (e.key === 'Escape') setIsEditingTitle(false);
        }}
        onBlur={submitEditTitle}
      />
    );
  }

  return (
    <div className="flex gap-4">
      <span
        data-tour="editor-title"
        className="text-[15px] font-medium"
        onDoubleClick={startEditTitle}
        title="Double-click to rename"
      >
        {projectTitle}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground w-[60px]">
        {saveStatus === 'saving' && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <Check className="h-3.5 w-3.5 text-primary" />
            Saved
          </>
        )}
        {saveStatus === 'error' && (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            Save failed
          </>
        )}
      </span>
    </div>
  );
}

interface EditorActionsProps {
  showWordCount: boolean;
  textStats: { words: number; characters: number };
  hasActiveTrail: boolean;
  trailViewActive: boolean;
  onToggleTrailView: () => void;
  projectId: string;
  visibility: ProjectVisibility;
  onVisibilityChange: (next: ProjectVisibility) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  tags: string;
  onTagsChange: (tags: string) => void;
  profile: { username: string; imageUrl: string | null } | null;
}

// Word count, the Trail-view toggle, share settings, and the user menu.
export function EditorActions({
  showWordCount,
  textStats,
  hasActiveTrail,
  trailViewActive,
  onToggleTrailView,
  projectId,
  visibility,
  onVisibilityChange,
  description,
  onDescriptionChange,
  tags,
  onTagsChange,
  profile,
}: EditorActionsProps) {
  return (
    <>
      {showWordCount && (
        <span className="text-xs text-muted-foreground">
          {textStats.words} words · {textStats.characters} characters
        </span>
      )}
      {hasActiveTrail && (
        <Button
          data-tour="trail-toggle"
          variant={trailViewActive ? 'secondary' : 'ghost'}
          size="lg"
          onClick={onToggleTrailView}
          title="Read this trail as a narrated sequence"
        >
          <Route className="h-[15px] w-[15px]" />
          Trail
        </Button>
      )}
      <ShareDialog
        projectId={projectId}
        visibility={visibility}
        onVisibilityChange={onVisibilityChange}
        description={description}
        onDescriptionChange={onDescriptionChange}
        tags={tags}
        onTagsChange={onTagsChange}
      />
      <VersionHistorySheet projectId={projectId} />
      <UserMenu loggedIn={!!profile} username={profile?.username ?? null} imageUrl={profile?.imageUrl ?? null} />
    </>
  );
}
