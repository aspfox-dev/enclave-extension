import { LlmError, type LlmMessage, type LlmRequest, type LlmResponse } from '@/shared/types/llm';
import { type ProviderConfig } from '@/shared/types/settings';

import { httpError } from './http';

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

function toMessageContent(message: LlmMessage): string | ContentPart[] {
  if (!message.images?.length) return message.content;

  const parts: ContentPart[] = [{ type: 'text', text: message.content }];
  for (const { mediaType, dataBase64 } of message.images) {
    parts.push({ type: 'image_url', image_url: { url: `data:${mediaType};base64,${dataBase64}` } });
  }
  return parts;
}

export async function callOpenAiCompatible(
  config: ProviderConfig,
  model: string,
  request: LlmRequest,
  provider: string,
): Promise<LlmResponse> {
  const { baseUrl, apiKey } = config;
  if (!baseUrl) throw new LlmError('No API endpoint is configured for this provider.', provider);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    signal: request.signal,
    body: JSON.stringify({
      model,
      messages: request.messages.map((message) => ({
        role: message.role,
        content: toMessageContent(message),
      })),
      temperature: request.temperature,
      max_tokens: request.maxTokens,
    }),
  });

  if (!response.ok) throw await httpError(response, provider);

  const data = (await response.json()) as ChatCompletionResponse;
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== 'string') {
    throw new LlmError('Response did not contain any message content.', provider);
  }
  return { text };
}
