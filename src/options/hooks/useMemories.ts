import { useCallback, useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { clearMemories, deleteMemory, listMemories } from '@/shared/storage/memory-store';
import { type MemoryEntry } from '@/shared/types/memory';

export interface MemoriesApi {
  memories: MemoryEntry[];
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

export function useMemories(): MemoriesApi {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);

  const refresh = useCallback(async () => {
    try {
      setMemories(await listMemories());
    } catch (error) {
      console.warn('Enclave: could not load memories.', error);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: chrome.storage.AreaName,
    ) => {
      if (area !== 'local' || !(STORAGE_KEYS.memories in changes)) return;
      const next = changes[STORAGE_KEYS.memories].newValue as MemoryEntry[] | undefined;
      setMemories(next ?? []);
    };
    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteMemory(id);
  }, []);

  const clear = useCallback(async () => {
    await clearMemories();
  }, []);

  return { memories, remove, clear };
}
