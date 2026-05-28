import { useState } from 'react';

import { DEFAULT_PROVIDER, type ProviderId } from '@/shared/constants/settings';
import { APP_NAME, SETTINGS_UI } from '@/shared/constants/strings';
import { type ProviderConfig } from '@/shared/types/settings';

import { LimitsForm } from './components/LimitsForm';
import { MemoryList } from './components/memory/MemoryList';
import { ProviderForm } from './components/ProviderForm';
import { ProviderTabs } from './components/ProviderTabs';
import { VaultForm } from './components/vault/VaultForm';
import { useMemories } from './hooks/useMemories';
import { type SaveState, useSettings } from './hooks/useSettings';
import { useVault } from './hooks/useVault';

const SAVE_MESSAGE: Record<SaveState, string> = {
  idle: '',
  saving: SETTINGS_UI.saving,
  saved: SETTINGS_UI.saved,
  error: SETTINGS_UI.saveError,
};

export function Options() {
  const { settings, saveState, update, persist } = useSettings();
  const vaultApi = useVault();
  const memoriesApi = useMemories();
  const [selected, setSelected] = useState<ProviderId>(DEFAULT_PROVIDER);

  if (!settings) {
    return <main className="px-6 py-10 text-[13px] text-slate-400">{SETTINGS_UI.loading}</main>;
  }

  const updateProvider = (config: ProviderConfig) =>
    update({ ...settings, providers: { ...settings.providers, [selected]: config } });

  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-10">
      <header className="mb-8">
        <h1 className="text-[20px] font-semibold text-slate-100">{APP_NAME} Settings</h1>
        <p className="mt-1 text-[13px] text-slate-500">
          Keys live only in this browser and never leave your device.
        </p>
      </header>

      <ProviderTabs selected={selected} active={settings.activeProvider} onSelect={setSelected} />
      <ProviderForm
        providerId={selected}
        config={settings.providers[selected]}
        isActive={settings.activeProvider === selected}
        onChange={updateProvider}
        onMakeActive={() => update({ ...settings, activeProvider: selected })}
      />
      <LimitsForm settings={settings} onChange={update} />

      <div className="mt-6 flex items-center gap-3 border-t border-surface-border pt-6">
        <button
          type="button"
          onClick={() => void persist()}
          className="rounded-md bg-accent px-4 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          {SETTINGS_UI.save}
        </button>
        {saveState !== 'idle' && (
          <span className={`text-[12px] ${saveState === 'error' ? 'text-status-error' : 'text-slate-400'}`}>
            {SAVE_MESSAGE[saveState]}
          </span>
        )}
      </div>

      {vaultApi.vault && (
        <VaultForm
          vault={vaultApi.vault}
          saveState={vaultApi.saveState}
          onChange={vaultApi.update}
          onSave={() => void vaultApi.persist()}
        />
      )}

      <MemoryList
        memories={memoriesApi.memories}
        memoryEnabled={settings.features.memory}
        onDelete={(id) => void memoriesApi.remove(id)}
        onClear={() => void memoriesApi.clear()}
      />
    </main>
  );
}
