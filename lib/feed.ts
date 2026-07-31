// Shared project-feed types and DTO mapping. Plain module (no "use server") so
// the sync mapper can be exported and reused across server-action files.

import type { Association } from "@/app/editor/types";

// Lightweight graph shape for a GRAPH-type thumbnail — item titles + associations
// only, no Lexical content, so cards never ship item bodies over the wire.
export interface GraphPreviewData {
  trailId: string;
  trailTitle: string;
  itemIds: string[];
  items: { id: string; title: string; associations: Association[] }[];
}

export interface ProjectFeedItem {
  id: string;
  title: string;
  description: string | null;
  ownerUsername: string;
  ownerAvatar: string | null;
  ownerBadge: string | null;
  thumbnailImageUrl: string | null;
  thumbnailGraph: GraphPreviewData | null;
  tags: string[];
  modifiedDate: string;
  publishedDate: string;
  lastPublishedDate: string | null;
  voteCount: number;
  votedByRequester: boolean;
  bookmarkedByRequester: boolean;
  viewCount: number;
  forkCount: number;
  commentCount: number;
  featured: boolean;
}

export interface ProjectFeedItemDTO {
  id: number;
  title: string;
  description: string | null;
  ownerUsername: string;
  ownerAvatar: string | null;
  ownerBadge: string | null;
  thumbnailImageUrl: string | null;
  thumbnailGraph: GraphPreviewData | null;
  tags: string[] | null;
  modifiedDate: string;
  publishedDate: string;
  lastPublishedDate: string | null;
  voteCount: number;
  votedByRequester: boolean;
  bookmarkedByRequester: boolean;
  viewCount: number;
  forkCount: number;
  commentCount: number;
  featured: boolean;
}

export function toFeedItem(item: ProjectFeedItemDTO): ProjectFeedItem {
  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    ownerUsername: item.ownerUsername,
    ownerAvatar: item.ownerAvatar,
    ownerBadge: item.ownerBadge,
    thumbnailImageUrl: item.thumbnailImageUrl,
    thumbnailGraph: item.thumbnailGraph,
    tags: item.tags ?? [],
    modifiedDate: item.modifiedDate,
    publishedDate: item.publishedDate,
    lastPublishedDate: item.lastPublishedDate,
    voteCount: item.voteCount,
    votedByRequester: item.votedByRequester,
    bookmarkedByRequester: item.bookmarkedByRequester,
    viewCount: item.viewCount,
    forkCount: item.forkCount,
    commentCount: item.commentCount,
    featured: item.featured,
  };
}
