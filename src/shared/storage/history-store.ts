import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { type TaskHistoryEntry } from '@/shared/types/verification';

const MAX_STORED_ENTRIES = 25;

export async function listTaskHistory(): Promise<TaskHistoryEntry[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.taskHistory);
  const entries = stored[STORAGE_KEYS.taskHistory] as TaskHistoryEntry[] | undefined;
  return entries ?? [];
}

export async function saveTaskHistoryEntry(entry: TaskHistoryEntry): Promise<void> {
  const existing = await listTaskHistory();
  const next = [entry, ...existing.filter((candidate) => candidate.id !== entry.id)].slice(
    0,
    MAX_STORED_ENTRIES,
  );
  await chrome.storage.local.set({ [STORAGE_KEYS.taskHistory]: next });
}

export async function deleteTaskHistoryEntry(id: string): Promise<void> {
  const existing = await listTaskHistory();
  const next = existing.filter((entry) => entry.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEYS.taskHistory]: next });
}

export async function clearTaskHistory(): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.taskHistory]: [] });
}
