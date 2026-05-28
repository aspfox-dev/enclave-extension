import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { type MemoryEntry } from '@/shared/types/memory';

const MAX_STORED_MEMORIES = 200;

export async function listMemories(): Promise<MemoryEntry[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.memories);
  const memories = stored[STORAGE_KEYS.memories] as MemoryEntry[] | undefined;
  return memories ?? [];
}

export async function appendMemories(entries: MemoryEntry[]): Promise<void> {
  if (entries.length === 0) return;
  const existing = await listMemories();
  const next = [...entries, ...existing].slice(0, MAX_STORED_MEMORIES);
  await chrome.storage.local.set({ [STORAGE_KEYS.memories]: next });
}

export async function deleteMemory(id: string): Promise<void> {
  const existing = await listMemories();
  const next = existing.filter((entry) => entry.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEYS.memories]: next });
}

export async function clearMemories(): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.memories]: [] });
}
