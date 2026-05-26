import { LlmError, type LlmMessage, type LlmRequest, type LlmResponse } from '@/shared/types/llm';
import { type ProviderConfig } from '@/shared/types/settings';

import { httpError } from './http';

const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MAX_TOKENS = 4096;

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

interface MessagesResponse {
  content?: { type: string; text?: string }[];
}

function toMessageContent(message: LlmMessage): string | ContentPart[] {
  if (!message.images?.length) return message.content;

  const parts: ContentPart[] = [{ type: 'text', text: message.content }];
  for (const { mediaType, dataBase64 } of message.images) {
    parts.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: dataBase64 } });
  }
  return parts;
}

export async function callAnthropic(
  config: ProviderConfig,
  model: string,
  request: LlmRequest,
  provider: string,
): Promise<LlmResponse> {
  const { baseUrl, apiKey } = config;
  if (!apiKey) throw new LlmError('Add your Anthropic API key in settings.', provider);

  const system = request.messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n');
  const messages = request.messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({ role: message.role, content: toMessageContent(message) }));

  const response = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    signal: request.signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      // Required for Anthropic to accept requests originating directly from a browser context.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
      system: system || undefined,
      messages,
      temperature: request.temperature,
    }),
  });

  if (!response.ok) throw await httpError(response, provider);

  const data = (await response.json()) as MessagesResponse;
  const text = data.content?.find((part) => part.type === 'text')?.text;
  if (typeof text !== 'string') {
    throw new LlmError('Response did not contain any text content.', provider);
  }
  return { text };
}
