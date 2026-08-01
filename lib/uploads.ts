'use server';
import { authenticatedFetch } from "./api";
import { API_BASE_URL } from "./config";

export type UploadKind = "avatar" | "thumbnail" | "editor-image" | "banner";

export interface UploadPresign {
  uploadUrl: string;
  publicUrl: string;
}

const MAX_RATE_LIMIT_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getUploadPresign(contentType: string, kind: UploadKind, contentHash: string, contentBytes: number, projectId?: string): Promise<UploadPresign> {
  for (let attempt = 1; attempt <= MAX_RATE_LIMIT_RETRIES; attempt++) {
    const response = await authenticatedFetch(`${API_BASE_URL}/api/uploads/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, kind, contentHash, contentBytes, ...(projectId ? { projectId } : {}) }),
    });
    if (response.ok) {
      return response.json();
    }
    // Batch image uploads can burst past the per-minute presign limit; back off and retry
    // using the server's Retry-After instead of failing the upload outright.
    if (response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
      const retryAfterSeconds = Number(response.headers.get("Retry-After")) || 5;
      await sleep(Math.min(retryAfterSeconds, 65) * 1000);
      continue;
    }
    // limit errors (storage quota, supporter-only GIF avatar) carry a user-facing message
    const message = await response.json().then((body) => body?.message).catch(() => null);
    throw new Error(message ?? `Request failed with status ${response.status}`);
  }
  throw new Error("Request failed after multiple attempts");
}
