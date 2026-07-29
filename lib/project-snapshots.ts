'use server';

import { authenticatedFetch } from "./api";
import { API_BASE_URL } from "./config";
import { parseResponse } from "./http";

export interface ProjectSnapshotSummary {
  id: string;
  version: number;
  createdAt: string;
}

export interface ProjectSnapshotItem {
  id: string;
  title: string;
  type: string | null;
  content: string | null;
}

export interface ProjectSnapshotTrail {
  id: string;
  title: string;
  version: number;
  items: ProjectSnapshotItem[];
}

export interface ProjectSnapshotDetail extends ProjectSnapshotSummary {
  trails: ProjectSnapshotTrail[];
}

interface ProjectSnapshotSummaryDTO {
  id: number;
  version: number;
  createdDate: string;
}

interface SnapshotItemDTO {
  id: number;
  title: string;
  type: string | null;
  content: string | null;
}

interface SnapshotTrailDTO {
  id: number;
  title: string;
  version: number;
  items: SnapshotItemDTO[];
}

interface ProjectSnapshotDetailDTO extends ProjectSnapshotSummaryDTO {
  content: {
    trails: SnapshotTrailDTO[];
  };
}

function toSummary(dto: ProjectSnapshotSummaryDTO): ProjectSnapshotSummary {
  return { id: String(dto.id), version: dto.version, createdAt: dto.createdDate };
}

export async function getProjectSnapshots(projectId: string): Promise<ProjectSnapshotSummary[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/project/${projectId}/versions`);
  const dtos = await parseResponse<ProjectSnapshotSummaryDTO[]>(response);
  return dtos.map(toSummary);
}

export async function getProjectSnapshot(
  projectId: string,
  snapshotId: string,
): Promise<ProjectSnapshotDetail | null> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/project/${projectId}/versions/${snapshotId}`);
  if (response.status === 404) return null;
  const dto = await parseResponse<ProjectSnapshotDetailDTO>(response);
  return {
    ...toSummary(dto),
    trails: dto.content.trails.map((trail) => ({
      id: String(trail.id),
      title: trail.title,
      version: trail.version,
      items: trail.items.map((item) => ({
        id: String(item.id),
        title: item.title,
        type: item.type,
        content: item.content,
      })),
    })),
  };
}
