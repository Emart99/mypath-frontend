'use server';
import { authenticatedFetch } from "./api";
import { API_BASE_URL } from "./config";
import { parseResponse } from "./http";

export async function getEditorTourSeen(): Promise<boolean> {
  const response = await authenticatedFetch(`${API_BASE_URL}/user/preferences`);
  const data = await parseResponse<{ editorTourSeen?: boolean }>(response);
  return data.editorTourSeen ?? false;
}

export async function setEditorTourSeen(seen: boolean = true): Promise<{ error: string | null }> {
  const response = await authenticatedFetch(`${API_BASE_URL}/user/preferences`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ editorTourSeen: seen }),
  });
  if (!response.ok) {
    return { error: `Request failed with status ${response.status}` };
  }
  return { error: null };
}
