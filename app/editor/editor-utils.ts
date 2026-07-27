export const lastItemStorageKey = (projectId: string) => `tramo:lastItem:${projectId}`;
export const SIDEBAR_OPEN_STORAGE_KEY = 'tramo:editorSidebarOpen';
export const CONNECTIONS_OPEN_STORAGE_KEY = 'tramo:editorConnectionsOpen';

export function countTextStats(content: string): { words: number; characters: number } {
  if (!content) return { words: 0, characters: 0 };
  try {
    const parsed = JSON.parse(content);
    const texts: string[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== 'object') return;
      const record = node as { text?: unknown; children?: unknown };
      if (typeof record.text === 'string') texts.push(record.text);
      if (Array.isArray(record.children)) record.children.forEach(walk);
    };
    walk((parsed as { root?: unknown }).root);
    const characters = texts.reduce((sum, text) => sum + text.length, 0);
    const joined = texts.join(' ').trim();
    const words = joined ? joined.split(/\s+/).length : 0;
    return { words, characters };
  } catch {
    return { words: 0, characters: 0 };
  }
}

export function isAuthError(err: unknown): boolean {
  return err instanceof Error && err.message.includes('401');
}
