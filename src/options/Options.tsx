import { useState } from 'react';

import { DEFAULT_PROVIDER, type ProviderId } from '@/shared/constants/settings';
import { APP_NAME, SETTINGS_UI } from '@/shared/constants/strings';
import { type ProviderConfig } from '@/shared/types/settings';

import { LimitsForm } from './components/LimitsForm';
import { ProviderForm } from './components/ProviderForm';
import { ProviderTabs } from './components/ProviderTabs';
import { VaultForm } from './components/vault/VaultForm';
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
  const [selected, setSelected] = useState<ProviderId>(DEFAULT_PROVIDER);

  if (!settings) {
    return <main className="px-6 py-10 text-sm text-slate-400">{SETTINGS_UI.loading}</main>;
  }

  const updateProvider = (config: ProviderConfig) =>
    update({ ...settings, providers: { ...settings.providers, [selected]: config } });

  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-xl font-semibold">{APP_NAME} Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
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

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void persist()}
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {SETTINGS_UI.save}
        </button>
        <span className="text-xs text-slate-400">{SAVE_MESSAGE[saveState]}</span>
      </div>

      {vaultApi.vault && (
        <VaultForm
          vault={vaultApi.vault}
          saveState={vaultApi.saveState}
          onChange={vaultApi.update}
          onSave={() => void vaultApi.persist()}
        />
      )}
    </main>
  );
}
