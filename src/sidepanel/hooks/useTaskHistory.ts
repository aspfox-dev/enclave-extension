import { useCallback, useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import {
  clearTaskHistory,
  deleteTaskHistoryEntry,
  listTaskHistory,
} from '@/shared/storage/history-store';
import { type TaskHistoryEntry } from '@/shared/types/verification';

export interface TaskHistoryApi {
  entries: TaskHistoryEntry[];
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

export function useTaskHistory(): TaskHistoryApi {
  const [entries, setEntries] = useState<TaskHistoryEntry[]>([]);

  const refresh = useCallback(async () => {
    try {
      setEntries(await listTaskHistory());
    } catch (error) {
      console.warn('Enclave: could not load task history.', error);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: chrome.storage.AreaName,
    ) => {
      if (area !== 'local' || !(STORAGE_KEYS.taskHistory in changes)) return;
      const next = changes[STORAGE_KEYS.taskHistory].newValue as TaskHistoryEntry[] | undefined;
      setEntries(next ?? []);
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteTaskHistoryEntry(id);
  }, []);

  const clear = useCallback(async () => {
    await clearTaskHistory();
  }, []);

  return { entries, remove, clear };
}
