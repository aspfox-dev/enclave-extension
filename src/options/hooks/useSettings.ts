import { useCallback, useEffect, useState } from 'react';

import { loadSettings, saveSettings } from '@/shared/storage/settings-store';
import { type Settings } from '@/shared/types/settings';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface SettingsApi {
  settings: Settings | null;
  saveState: SaveState;
  update: (next: Settings) => void;
  persist: () => Promise<void>;
}

export function useSettings(): SettingsApi {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const loaded = await loadSettings();
        if (active) setSettings(loaded);
      } catch {
        if (active) setSaveState('error');
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((next: Settings) => {
    setSettings(next);
    setSaveState('idle');
  }, []);

  const persist = useCallback(async () => {
    if (!settings) return;
    setSaveState('saving');
    try {
      await saveSettings(settings);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, [settings]);

  return { settings, saveState, update, persist };
}
