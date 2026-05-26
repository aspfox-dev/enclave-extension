import { type ModelSlots } from '@/shared/types/settings';

export const PROVIDER_IDS = [
  'openai',
  'anthropic',
  'gemini',
  'deepseek',
  'grok',
  'ollama',
  'custom',
] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
  deepseek: 'DeepSeek',
  grok: 'xAI Grok',
  ollama: 'Ollama (local)',
  custom: 'Custom endpoint',
};

export const CHAT_SUBMODES = ['quick', 'pro'] as const;
export type ChatSubmode = (typeof CHAT_SUBMODES)[number];

export const MODEL_SLOTS = ['agent', 'vision', 'chat', 'research'] as const;
export type ModelSlot = (typeof MODEL_SLOTS)[number];

export const MODEL_SLOT_LABELS: Record<ModelSlot, string> = {
  agent: 'Agent',
  vision: 'Vision',
  chat: 'Chat',
  research: 'Research',
};

export const MODEL_SLOT_HINTS: Record<ModelSlot, string> = {
  agent: 'Reasoning-heavy planning and action selection',
  vision: 'Must be vision-capable — used for escalation and verification',
  chat: 'Page question answering',
  research: 'Source summarization during research runs',
};

export const DEFAULT_PROVIDER: ProviderId = 'openai';

export const PROVIDER_BASE_URLS: Record<ProviderId, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta',
  deepseek: 'https://api.deepseek.com/v1',
  grok: 'https://api.x.ai/v1',
  ollama: 'http://localhost:11434/v1',
  custom: '',
};

export const DEFAULT_AGENT_LIMITS = {
  maxSteps: 20,
  stepDelayMs: 2_000,
  llmTimeoutMs: 100_000,
  wallTimeoutMs: 300_000,
} as const;

export const DEFAULT_FEATURE_FLAGS = {
  visionEscalation: true,
  memory: true,
} as const;

export const DEFAULT_CHAT_SUBMODE: ChatSubmode = 'quick';

export const DEFAULT_PROVIDER_MODELS: Record<ProviderId, ModelSlots> = {
  openai: { agent: 'gpt-4o', vision: 'gpt-4o', chat: 'gpt-4o-mini', research: 'gpt-4o-mini' },
  anthropic: {
    agent: 'claude-sonnet-4-20250514',
    vision: 'claude-sonnet-4-20250514',
    chat: 'claude-3-5-haiku-20241022',
    research: 'claude-3-5-haiku-20241022',
  },
  gemini: {
    agent: 'gemini-2.0-flash',
    vision: 'gemini-2.0-flash',
    chat: 'gemini-2.0-flash',
    research: 'gemini-1.5-pro',
  },
  deepseek: { agent: 'deepseek-chat', vision: 'deepseek-chat', chat: 'deepseek-chat', research: 'deepseek-chat' },
  grok: { agent: 'grok-3', vision: 'grok-2-vision-1212', chat: 'grok-3', research: 'grok-3' },
  ollama: { agent: 'llama3.1', vision: 'llava', chat: 'llama3.1', research: 'llama3.1' },
  custom: { agent: '', vision: '', chat: '', research: '' },
};
