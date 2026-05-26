import { useCallback, useEffect, useState } from 'react';

import { loadVault, saveVault } from '@/shared/storage/vault-store';
import { type Vault } from '@/shared/types/vault';

import { type SaveState } from './useSettings';

export interface VaultApi {
  vault: Vault | null;
  saveState: SaveState;
  update: (next: Vault) => void;
  persist: () => Promise<void>;
}

export function useVault(): VaultApi {
  const [vault, setVault] = useState<Vault | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const loaded = await loadVault();
        if (active) setVault(loaded);
      } catch {
        if (active) setSaveState('error');
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((next: Vault) => {
    setVault(next);
    setSaveState('idle');
  }, []);

  const persist = useCallback(async () => {
    if (!vault) return;
    setSaveState('saving');
    try {
      await saveVault(vault);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, [vault]);

  return { vault, saveState, update, persist };
}
