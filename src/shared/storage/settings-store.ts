import {
  DEFAULT_AGENT_LIMITS,
  DEFAULT_CHAT_SUBMODE,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_PROVIDER,
  DEFAULT_PROVIDER_MODELS,
  PROVIDER_BASE_URLS,
  PROVIDER_IDS,
  type ProviderId,
} from '@/shared/constants/settings';
import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { type ProviderConfig, type Settings } from '@/shared/types/settings';

function defaultProviders(): Record<ProviderId, ProviderConfig> {
  const entries = PROVIDER_IDS.map((id): [ProviderId, ProviderConfig] => [
    id,
    { apiKey: '', baseUrl: PROVIDER_BASE_URLS[id], models: { ...DEFAULT_PROVIDER_MODELS[id] } },
  ]);
  return Object.fromEntries(entries) as Record<ProviderId, ProviderConfig>;
}

export function defaultSettings(): Settings {
  return {
    activeProvider: DEFAULT_PROVIDER,
    providers: defaultProviders(),
    limits: { ...DEFAULT_AGENT_LIMITS },
    features: { ...DEFAULT_FEATURE_FLAGS },
    chatSubmode: DEFAULT_CHAT_SUBMODE,
  };
}

function mergeProvider(base: ProviderConfig, saved: Partial<ProviderConfig>): ProviderConfig {
  return {
    apiKey: saved.apiKey ?? base.apiKey,
    baseUrl: saved.baseUrl ?? base.baseUrl,
    models: { ...base.models, ...saved.models },
  };
}

function merge(saved: Partial<Settings>): Settings {
  const base = defaultSettings();
  const providers = { ...base.providers };
  for (const id of PROVIDER_IDS) {
    const savedProvider = saved.providers?.[id];
    if (savedProvider) providers[id] = mergeProvider(base.providers[id], savedProvider);
  }

  return {
    activeProvider: saved.activeProvider ?? base.activeProvider,
    providers,
    limits: { ...base.limits, ...saved.limits },
    features: { ...base.features, ...saved.features },
    chatSubmode: saved.chatSubmode ?? base.chatSubmode,
  };
}

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.settings);
  const saved = stored[STORAGE_KEYS.settings] as Partial<Settings> | undefined;
  return saved ? merge(saved) : defaultSettings();
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.settings]: settings });
}
