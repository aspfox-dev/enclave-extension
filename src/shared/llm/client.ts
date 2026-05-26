import {
  PROVIDER_LABELS,
  type ModelSlot,
  type ProviderId,
} from '@/shared/constants/settings';
import { loadSettings } from '@/shared/storage/settings-store';
import { LlmError, type LlmRequest, type LlmResponse } from '@/shared/types/llm';
import { type ProviderConfig } from '@/shared/types/settings';
import { withTimeout } from '@/shared/util/timeout';

import { callAnthropic } from './anthropic';
import { callGemini } from './gemini';
import { callOpenAiCompatible } from './openai-compatible';

function dispatch(
  provider: ProviderId,
  config: ProviderConfig,
  model: string,
  request: LlmRequest,
): Promise<LlmResponse> {
  const label = PROVIDER_LABELS[provider];
  if (provider === 'anthropic') return callAnthropic(config, model, request, label);
  if (provider === 'gemini') return callGemini(config, model, request, label);
  return callOpenAiCompatible(config, model, request, label);
}

export async function runLlm(slot: ModelSlot, request: LlmRequest): Promise<LlmResponse> {
  const settings = await loadSettings();
  const provider = settings.activeProvider;
  const config = settings.providers[provider];
  const model = config.models[slot];
  const label = PROVIDER_LABELS[provider];

  if (!model) throw new LlmError(`No ${slot} model is configured for ${label}.`, label);

  return withTimeout(
    (timeoutSignal) => {
      const signal = request.signal
        ? AbortSignal.any([timeoutSignal, request.signal])
        : timeoutSignal;
      return dispatch(provider, config, model, { ...request, signal });
    },
    settings.limits.llmTimeoutMs,
    `${label} did not respond within the configured timeout.`,
  );
}
