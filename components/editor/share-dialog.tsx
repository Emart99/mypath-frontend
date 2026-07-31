"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, Globe, ImageIcon, Loader2, Lock, Share2, Upload, Users, Waypoints } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  setProjectVisibility,
  setProjectDescription,
  setProjectTags,
  publishProject,
  setProjectThumbnail,
  getProject,
  getProjectImages,
  type ProjectVisibility,
  type ProjectImage,
} from "@/lib/projects-store"
import { autocompleteTags, type TagSuggestion } from "@/lib/tags"
import { uploadImage } from "@/lib/upload-image"
import { cn } from "@/lib/utils"
import { ProjectThumbnail } from "@/components/project/project-thumbnail"
import type { Trail } from "@/app/editor/types"
import type { GraphPreviewData } from "@/lib/feed"

interface ShareDialogProps {
  projectId: string;
  visibility: ProjectVisibility;
  onVisibilityChange: (visibility: ProjectVisibility) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  tags: string;
  onTagsChange: (tags: string) => void;
  trails: Trail[];
  thumbnailImageUrl: string | null;
  thumbnailGraph: GraphPreviewData | null;
  onThumbnailChange: (imageUrl: string | null, graph: GraphPreviewData | null) => void;
}

const OPTIONS: {
  value: ProjectVisibility;
  label: string;
  icon: typeof Lock;
  description: string;
}[] = [
  {
    value: "private",
    label: "Private",
    icon: Lock,
    description: "Only you can access this project",
  },
  {
    value: "unlisted",
    label: "Unlisted",
    icon: Users,
    description: "Anyone with the link can view this project",
  },
  {
    value: "published",
    label: "Published",
    icon: Globe,
    description: "Anyone with the link can view it, and it's listed on the Explore page",
  },
];

export function ShareDialog({
  projectId,
  visibility,
  onVisibilityChange,
  description,
  onDescriptionChange,
  tags,
  onTagsChange,
  trails,
  thumbnailImageUrl,
  thumbnailGraph,
  onThumbnailChange,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState(visibility);
  const [descriptionInput, setDescriptionInput] = useState(description);
  const [tagsInput, setTagsInput] = useState(tags);
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(0);
  const tagsInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [thumbnailTab, setThumbnailTab] = useState<"graph" | "image" | "upload">("graph");
  const [projectImages, setProjectImages] = useState<ProjectImage[] | null>(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [thumbnailSaving, setThumbnailSaving] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${projectId}`
    : "";
  const selected = OPTIONS.find((option) => option.value === selectedVisibility) ?? OPTIONS[0];
  const hasPendingChange = selectedVisibility !== visibility;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setSelectedVisibility(visibility);
      setDescriptionInput(description);
      setTagsInput(tags);
      setSuggestionsOpen(false);
      setValidationError(null);
      setJustPublished(false);
    }
    setOpen(next);
  };

  const submitDescription = async () => {
    const next = descriptionInput.trim();
    if (next === description) return;
    onDescriptionChange(next);
    await setProjectDescription(projectId, next);
  };

  const submitTags = async () => {
    setSuggestionsOpen(false);
    const next = tagsInput.trim();
    if (next === tags) return;
    onTagsChange(next);
    await setProjectTags(projectId, next);
  };

  // Suggests existing tags for whatever the user is typing after the last comma,
  // pushing reuse of the shared catalog instead of near-duplicate tags.
  useEffect(() => {
    const fragment = tagsInput.split(",").pop()?.trim() ?? "";
    if (!fragment) {
      setTagSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const results = await autocompleteTags(fragment);
        setTagSuggestions(results);
        setSuggestionsOpen(results.length > 0);
        setHighlightedSuggestion(0);
      } catch {
        setTagSuggestions([]);
        setSuggestionsOpen(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [tagsInput]);

  const selectTagSuggestion = (name: string) => {
    const segments = tagsInput.split(",");
    segments[segments.length - 1] = ` ${name}`;
    setTagsInput(segments.join(",").trimStart() + ", ");
    setTagSuggestions([]);
    setSuggestionsOpen(false);
    tagsInputRef.current?.focus();
  };

  const applyVisibility = async () => {
    if (!hasPendingChange || isApplying) return;

    if (selectedVisibility === "published" && !descriptionInput.trim()) {
      setValidationError("Add a description before publishing.");
      return;
    }

    setIsApplying(true);
    setValidationError(null);
    try {
      if (descriptionInput.trim() !== description) {
        await submitDescription();
      }
      const publishing = selectedVisibility === "published";
      onVisibilityChange(selectedVisibility);
      const { error } = await setProjectVisibility(projectId, selectedVisibility);
      if (error) {
        setSelectedVisibility(visibility);
        onVisibilityChange(visibility);
        setValidationError(error);
      } else if (publishing) {
        setJustPublished(true);
        setTimeout(() => setJustPublished(false), 2000);
      }
    } catch {
      setSelectedVisibility(visibility);
      onVisibilityChange(visibility);
      setValidationError("Something went wrong — try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const handlePublish = async () => {
    if (isApplying) return;
    if (!descriptionInput.trim()) {
      setValidationError("Add a description before publishing.");
      return;
    }
    setIsApplying(true);
    setValidationError(null);
    try {
      if (descriptionInput.trim() !== description) {
        await submitDescription();
      }
      const { error } = await publishProject(projectId);
      if (error) {
        setValidationError(error);
      } else {
        setJustPublished(true);
        setTimeout(() => setJustPublished(false), 2000);
      }
    } catch {
      setValidationError("Something went wrong — try again.");
    } finally {
      setIsApplying(false);
    }
  };

  useEffect(() => {
    if (thumbnailTab !== "image" || projectImages !== null) return;
    setImagesLoading(true);
    getProjectImages(projectId)
      .then(setProjectImages)
      .catch(() => setProjectImages([]))
      .finally(() => setImagesLoading(false));
  }, [thumbnailTab, projectImages, projectId]);

  const applyThumbnail = async (
    choice: Parameters<typeof setProjectThumbnail>[1],
    optimistic: { imageUrl: string | null; graph: GraphPreviewData | null }
  ) => {
    setThumbnailSaving(true);
    onThumbnailChange(optimistic.imageUrl, optimistic.graph);
    try {
      await setProjectThumbnail(projectId, choice);
      const project = await getProject(projectId);
      if (project) onThumbnailChange(project.thumbnailImageUrl, project.thumbnailGraph);
    } catch {
      setValidationError("Couldn't update the thumbnail — try again.");
    } finally {
      setThumbnailSaving(false);
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    setThumbnailSaving(true);
    try {
      const url = await uploadImage(file, "thumbnail", projectId);
      await applyThumbnail({ type: "DEDICATED", imageUrl: url }, { imageUrl: url, graph: null });
    } catch {
      setValidationError("Upload failed — try again.");
      setThumbnailSaving(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button data-tour="share" variant="secondary" size="lg">
          <Share2 className="h-[15px] w-[15px]" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this project</DialogTitle>
          <DialogDescription>
            Control who can access this project and whether it&apos;s publicly listed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === selectedVisibility;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSelectedVisibility(option.value);
                  setValidationError(null);
                }}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors",
                  isActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{selected.description}</p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="share-description">Description</Label>
          <Textarea
            id="share-description"
            placeholder="What's this project about?"
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            onBlur={submitDescription}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Required to publish. Shown on Explore and the public project page.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="share-tags">Tags</Label>
          <div className="relative">
            <Input
              id="share-tags"
              ref={tagsInputRef}
              placeholder="webdev, react, tutorial"
              autoComplete="off"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onFocus={() => setSuggestionsOpen(tagSuggestions.length > 0)}
              onBlur={submitTags}
              onKeyDown={(e) => {
                if (suggestionsOpen && tagSuggestions.length > 0) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlightedSuggestion((i) => (i + 1) % tagSuggestions.length);
                    return;
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedSuggestion((i) => (i - 1 + tagSuggestions.length) % tagSuggestions.length);
                    return;
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    selectTagSuggestion(tagSuggestions[highlightedSuggestion].name);
                    return;
                  }
                  if (e.key === "Escape") {
                    setSuggestionsOpen(false);
                    return;
                  }
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitTags();
                }
              }}
            />
            {suggestionsOpen && tagSuggestions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                {tagSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.name}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectTagSuggestion(suggestion.name)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",
                      index === highlightedSuggestion ? "bg-muted" : "hover:bg-muted"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {suggestion.name}
                      {suggestion.official && (
                        <span className="text-[10px] font-medium tracking-wide text-primary uppercase">
                          Official
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">{suggestion.usageCount}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Comma-separated. Helps people find this on Explore and shows up in Hot topics.
          </p>
        </div>

        {selectedVisibility === "published" && (
          <div className="flex flex-col gap-1.5">
            <Label>Thumbnail</Label>
            <div className="flex gap-3">
              <ProjectThumbnail
                thumbnailImageUrl={thumbnailImageUrl}
                thumbnailGraph={thumbnailGraph}
                title={descriptionInput || "Project"}
                className="h-16 w-16 shrink-0 rounded-md bg-surface-container-high"
              />
              <div className="flex flex-1 flex-col gap-2 min-w-0">
                <div className="flex gap-1">
                  {[
                    { key: "graph" as const, label: "Trail", icon: Waypoints },
                    { key: "image" as const, label: "Image", icon: ImageIcon },
                    { key: "upload" as const, label: "Upload", icon: Upload },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setThumbnailTab(key)}
                      className={cn(
                        "flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors",
                        thumbnailTab === key ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </button>
                  ))}
                  {thumbnailSaving && <Loader2 className="h-3.5 w-3.5 animate-spin self-center text-muted-foreground" />}
                </div>

                {thumbnailTab === "graph" && (
                  <div className="flex flex-wrap gap-1.5">
                    {trails.filter((t) => t.itemIds.length > 0).map((trail) => (
                      <button
                        key={trail.id}
                        type="button"
                        disabled={thumbnailSaving}
                        onClick={() => applyThumbnail({ type: "GRAPH", trailId: trail.id }, { imageUrl: null, graph: null })}
                        className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                      >
                        {trail.title}
                      </button>
                    ))}
                    {trails.every((t) => t.itemIds.length === 0) && (
                      <p className="text-xs text-muted-foreground">No trails with items yet.</p>
                    )}
                  </div>
                )}

                {thumbnailTab === "image" && (
                  <div className="flex flex-wrap gap-1.5">
                    {imagesLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!imagesLoading && projectImages?.length === 0 && (
                      <p className="text-xs text-muted-foreground">No images in this project yet.</p>
                    )}
                    {projectImages?.map((img) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img.url}
                        src={img.url}
                        alt={img.itemTitle}
                        title={img.itemTitle}
                        onClick={() =>
                          !thumbnailSaving &&
                          applyThumbnail(
                            { type: "PROJECT_IMAGE", imageUrl: img.url },
                            { imageUrl: img.url, graph: null }
                          )
                        }
                        className="h-12 w-12 cursor-pointer rounded-md border border-border object-cover hover:border-primary"
                      />
                    ))}
                  </div>
                )}

                {thumbnailTab === "upload" && (
                  <div>
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) handleThumbnailUpload(file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={thumbnailSaving}
                      onClick={() => uploadInputRef.current?.click()}
                    >
                      Choose image
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {visibility !== "private" && (
          <div className="flex items-center gap-2">
            <Label htmlFor="share-link" className="sr-only">
              Share link
            </Label>
            <Input id="share-link" readOnly value={shareUrl} className="flex-1" />
            <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy link">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {(hasPendingChange || validationError || (!hasPendingChange && visibility === "published")) && (
          <DialogFooter className="flex-col items-stretch gap-2 sm:flex-col">
            {validationError && (
              <p className="text-xs text-destructive">{validationError}</p>
            )}
            {hasPendingChange && (
              <Button onClick={applyVisibility} disabled={isApplying} className="w-full">
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {selectedVisibility === "published" ? "Publishing..." : "Applying..."}
                  </>
                ) : (
                  `Switch to ${selected.label}`
                )}
              </Button>
            )}
            {!hasPendingChange && visibility === "published" && (
              <Button onClick={handlePublish} disabled={isApplying || justPublished} className="w-full">
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : justPublished ? (
                  <>
                    <Check className="h-4 w-4" />
                    Published
                  </>
                ) : (
                  "Publish update"
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
