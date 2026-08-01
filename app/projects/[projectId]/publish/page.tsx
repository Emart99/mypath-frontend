"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft,
  Check,
  Globe,
  ImageIcon,
  Loader2,
  Lock,
  Route,
  Upload,
  Users,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ExploreCard } from "@/components/feed/explore-card"
import { ProjectThumbnail } from "@/components/project/project-thumbnail"
import {
  getProject,
  setProjectVisibility,
  setProjectDescription,
  setProjectTags,
  publishProject,
  setProjectThumbnail,
  getProjectImages,
  type Project,
  type ProjectVisibility,
  type ProjectImage,
  type ThumbnailChoice,
} from "@/lib/projects-store"
import { getMyProfile } from "@/lib/profile"
import type { ProjectFeedItem } from "@/lib/public-project"
import { uploadImage } from "@/lib/upload-image"
import { cn } from "@/lib/utils"

// Static context cards around "Your project" in the preview — just set dressing
// to sell the Explore layout, so no need to fetch real projects for them.
const MOCK_NEIGHBORS: ProjectFeedItem[] = [
  {
    id: "mock-1",
    title: "Mapping the origins of jazz",
    description: "A short trail through the roots of jazz, from New Orleans brass bands to bebop.",
    ownerUsername: "nolan",
    ownerAvatar: null,
    ownerBadge: null,
    thumbnailImageUrl: null,
    thumbnailGraph: null,
    tags: ["music", "history"],
    modifiedDate: new Date().toISOString(),
    publishedDate: new Date().toISOString(),
    lastPublishedDate: null,
    voteCount: 24,
    votedByRequester: false,
    bookmarkedByRequester: false,
    viewCount: 812,
    forkCount: 3,
    commentCount: 5,
    featured: false,
  },
  {
    id: "mock-2",
    title: "A field guide to houseplants",
    description: "Light, water, and soil notes for the plants that actually survive my apartment.",
    ownerUsername: "sage",
    ownerAvatar: null,
    ownerBadge: null,
    thumbnailImageUrl: null,
    thumbnailGraph: null,
    tags: ["plants", "guide"],
    modifiedDate: new Date().toISOString(),
    publishedDate: new Date().toISOString(),
    lastPublishedDate: null,
    voteCount: 9,
    votedByRequester: false,
    bookmarkedByRequester: false,
    viewCount: 203,
    forkCount: 0,
    commentCount: 1,
    featured: false,
  },
];

const VISIBILITY_OPTIONS: {
  value: ProjectVisibility;
  label: string;
  description: string;
  icon: typeof Lock;
}[] = [
  { value: "private", label: "Private", description: "Only you can access this project", icon: Lock },
  { value: "unlisted", label: "Unlisted", description: "Anyone with the link can view it", icon: Users },
  { value: "published", label: "Published", description: "Listed on Explore for everyone", icon: Globe },
];

export default function PublishPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<{ username: string; imageUrl: string | null; selectedBadge: string | null } | null>(null);

  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>("private");
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null);
  const [thumbnailGraph, setThumbnailGraph] = useState<Project["thumbnailGraph"]>(null);

  // Which tab is selected — drives both the highlighted tab and which panel (if any)
  // is expanded below. Clicking Trail/Project image selects it directly; Upload has
  // no panel of its own, so it's only selected once a file finishes uploading.
  const [thumbnailTab, setThumbnailTab] = useState<"trail" | "image" | "upload">("trail");
  const [projectImages, setProjectImages] = useState<ProjectImage[] | null>(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [thumbnailSaving, setThumbnailSaving] = useState(false);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProject(projectId).then((p) => {
      if (!p) return;
      setProject(p);
      setDescription(p.description);
      setTags(p.tags);
      setVisibility(p.visibility);
      setThumbnailImageUrl(p.thumbnailImageUrl);
      setThumbnailGraph(p.thumbnailGraph);
    });
    getMyProfile().then((p) => p && setProfile({ username: p.username, imageUrl: p.imageUrl, selectedBadge: p.selectedBadge }));
  }, [projectId]);

  useEffect(() => {
    if (thumbnailTab !== "image" || projectImages !== null) return;
    setImagesLoading(true);
    getProjectImages(projectId)
      .then(setProjectImages)
      .catch(() => setProjectImages([]))
      .finally(() => setImagesLoading(false));
  }, [thumbnailTab, projectImages, projectId]);

  if (!project) return null;

  const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);

  const yourCard: ProjectFeedItem = {
    id: project.id,
    title: project.title,
    description: description || null,
    ownerUsername: profile?.username ?? "you",
    ownerAvatar: profile?.imageUrl ?? null,
    ownerBadge: profile?.selectedBadge ?? null,
    thumbnailImageUrl,
    thumbnailGraph,
    tags: tagList,
    modifiedDate: project.updatedAt,
    publishedDate: project.updatedAt,
    lastPublishedDate: null,
    voteCount: 0,
    votedByRequester: false,
    bookmarkedByRequester: false,
    viewCount: 0,
    forkCount: 0,
    commentCount: 0,
    featured: false,
  };

  const submitDescription = async () => {
    const next = description.trim();
    if (next === project.description) return;
    setProject({ ...project, description: next });
    await setProjectDescription(projectId, next);
  };

  const submitTags = async () => {
    const next = tags.trim();
    if (next === project.tags) return;
    setProject({ ...project, tags: next });
    await setProjectTags(projectId, next);
  };

  const changeVisibility = async (next: ProjectVisibility) => {
    if (next === visibility || visibilitySaving) return;
    setVisibilitySaving(true);
    setError(null);
    const prev = visibility;
    setVisibility(next);
    const { error: err } = await setProjectVisibility(projectId, next);
    if (err) {
      setVisibility(prev);
      setError(err);
    }
    setVisibilitySaving(false);
  };

  const applyThumbnail = async (choice: ThumbnailChoice, optimistic: { imageUrl: string | null; graph: Project["thumbnailGraph"] }) => {
    setThumbnailSaving(true);
    setThumbnailImageUrl(optimistic.imageUrl);
    setThumbnailGraph(optimistic.graph);
    try {
      await setProjectThumbnail(projectId, choice);
    } catch {
      setError("Couldn't update the thumbnail — try again.");
    } finally {
      setThumbnailSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    setThumbnailSaving(true);
    try {
      const url = await uploadImage(file, "thumbnail", projectId);
      await applyThumbnail({ type: "DEDICATED", imageUrl: url }, { imageUrl: url, graph: null });
      setThumbnailTab("upload");
    } catch {
      setError("Upload failed — try again.");
      setThumbnailSaving(false);
    }
  };

  const handlePublish = async () => {
    if (isPublishing) return;
    if (!description.trim()) {
      setError("Add a description before publishing.");
      return;
    }
    setIsPublishing(true);
    setError(null);
    try {
      if (description.trim() !== project.description) await submitDescription();
      if (visibility === "private") await changeVisibility("published");
      const { error: err } = await publishProject(projectId);
      if (err) {
        setError(err);
      } else {
        setJustPublished(true);
        setTimeout(() => setJustPublished(false), 2000);
      }
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex h-svh flex-col bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[60px_1fr]">
      <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border px-6 lg:col-start-1 lg:row-start-1 lg:border-b-0">
        <button
          type="button"
          onClick={() => router.push(`/editor/${projectId}`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Editor
        </button>
        <span className="h-4 w-px bg-border" />
        <span className="text-[15px] font-semibold">Publish</span>
      </div>

      <div className="flex-1 overflow-y-auto lg:col-start-1 lg:row-start-2 lg:min-h-0">
        <div className="flex flex-col gap-3 bg-muted p-7">
          <span className="text-[12px] font-semibold uppercase tracking-[.04em] text-muted-foreground">
            Explore preview
          </span>
          <div className="opacity-40">
            <ExploreCard project={MOCK_NEIGHBORS[0]} loggedIn={false} username={null} interactive={false} />
          </div>
          <div className="relative rounded-[14px] ring-2 ring-foreground">
            <span className="absolute -top-3 left-4 z-10 rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-medium text-background">
              Your project
            </span>
            <ExploreCard project={yourCard} loggedIn={false} username={null} interactive={false} />
          </div>
          <div className="opacity-40">
            <ExploreCard project={MOCK_NEIGHBORS[1]} loggedIn={false} username={null} interactive={false} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto border-l border-border p-6 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:min-h-0 [&>*]:shrink-0">
            <div className="flex flex-col gap-1.5">
              <Label>Visibility</Label>
              <div className="flex flex-col gap-2">
                {VISIBILITY_OPTIONS.map((option) => {
                  const isActive = option.value === visibility;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={visibilitySaving}
                      onClick={() => changeVisibility(option.value)}
                      className={cn(
                        "flex items-center gap-3 rounded-md border px-3.5 py-2.5 text-left transition-colors disabled:opacity-60",
                        isActive ? "border-foreground bg-foreground/5" : "border-border hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium">{option.label}</span>
                        <span className="block truncate text-[12px] text-muted-foreground">{option.description}</span>
                      </span>
                      {isActive && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="publish-description">Description</Label>
              <Textarea
                id="publish-description"
                placeholder="What's this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={submitDescription}
                rows={4}
                className="resize-none rounded-xs border-input px-4 py-3 shadow-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="publish-tags">Tags</Label>
              <Input
                id="publish-tags"
                placeholder="webdev, react, tutorial"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                onBlur={submitTags}
              />
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tagList.map((tag) => (
                    <span key={tag} className="rounded-sm border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Thumbnail</Label>
                {thumbnailSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </div>

              <ProjectThumbnail
                thumbnailImageUrl={thumbnailImageUrl}
                thumbnailGraph={thumbnailGraph}
                title={project.title}
                className="h-48 w-full rounded-lg border border-border bg-surface-container-high"
              />

              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { key: "trail", label: "Trail", icon: Route },
                  { key: "image", label: "Project image", icon: ImageIcon },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setThumbnailTab(key)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[12px] font-medium transition-colors",
                      thumbnailTab === key ? "border-foreground bg-foreground/5" : "border-border hover:bg-muted"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
                <UploadThumbnailTab disabled={thumbnailSaving} active={thumbnailTab === "upload"} onFile={handleUpload} />
              </div>

              {thumbnailTab === "trail" && (
                <div className="flex flex-wrap gap-1.5">
                  {project.trails.filter((t) => t.itemIds.length > 0).map((trail) => {
                    const isActive = thumbnailGraph?.trailId === trail.id;
                    return (
                      <button
                        key={trail.id}
                        type="button"
                        disabled={thumbnailSaving}
                        onClick={() => {
                          const graph = {
                            trailId: trail.id,
                            trailTitle: trail.title,
                            itemIds: trail.itemIds,
                            items: trail.itemIds.map((id) => ({
                              id,
                              title: project.items[id]?.title ?? "",
                              associations: project.items[id]?.associations ?? [],
                            })),
                          };
                          applyThumbnail({ type: "GRAPH", trailId: trail.id }, { imageUrl: null, graph });
                        }}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs disabled:opacity-50",
                          isActive ? "border-foreground bg-foreground/5" : "border-border hover:bg-muted"
                        )}
                      >
                        {trail.title}
                      </button>
                    );
                  })}
                  {project.trails.every((t) => t.itemIds.length === 0) && (
                    <p className="text-xs text-muted-foreground">No trails with items yet.</p>
                  )}
                </div>
              )}

              {thumbnailTab === "image" && (
                <div className="flex flex-wrap gap-2">
                  {imagesLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!imagesLoading && projectImages?.length === 0 && (
                    <p className="text-xs text-muted-foreground">No images in this project yet.</p>
                  )}
                  {projectImages?.slice(0, 3).map((img) => {
                    const isActive = thumbnailImageUrl === img.url;
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img.url}
                        src={img.url}
                        alt={img.itemTitle}
                        title={img.itemTitle}
                        onClick={() => !thumbnailSaving && applyThumbnail(
                          { type: "PROJECT_IMAGE", imageUrl: img.url },
                          { imageUrl: img.url, graph: null }
                        )}
                        className={cn(
                          "h-24 w-[104px] cursor-pointer rounded-lg border object-cover",
                          isActive ? "outline outline-2 outline-foreground" : "border-border hover:border-foreground"
                        )}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || justPublished}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[14px] font-medium text-background shadow-elevation-2 disabled:opacity-60"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {project.visibility === "published" ? "Updating..." : "Publishing..."}
                </>
              ) : justPublished ? (
                <>
                  <Check className="h-4 w-4" />
                  {project.visibility === "published" ? "Updated" : "Published"}
                </>
              ) : (
                project.visibility === "published" ? "Update" : "Publish"
              )}
            </button>
          </div>
    </div>
  );
}

// Opens the native file picker directly on click — no intermediate "Choose image" step.
function UploadThumbnailTab({ disabled, active, onFile }: { disabled: boolean; active: boolean; onFile: (file: File) => void }) {
  return (
    <label
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[12px] font-medium transition-colors",
        active ? "border-foreground bg-foreground/5" : "border-border hover:bg-muted",
        disabled ? "pointer-events-none opacity-50" : "cursor-pointer"
      )}
    >
      <input
        type="file"
        accept="image/*"
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
      <Upload className="h-3.5 w-3.5" />
      Upload
    </label>
  );
}
