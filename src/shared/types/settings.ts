import { type ChatSubmode, type ProviderId } from '@/shared/constants/settings';

export interface ModelSlots {
  agent: string;
  vision: string;
  chat: string;
  research: string;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  models: ModelSlots;
}

export interface AgentLimits {
  maxSteps: number;
  stepDelayMs: number;
  llmTimeoutMs: number;
  wallTimeoutMs: number;
}

export interface FeatureFlags {
  visionEscalation: boolean;
  memory: boolean;
}

export interface Settings {
  activeProvider: ProviderId;
  providers: Record<ProviderId, ProviderConfig>;
  limits: AgentLimits;
  features: FeatureFlags;
  chatSubmode: ChatSubmode;
}
