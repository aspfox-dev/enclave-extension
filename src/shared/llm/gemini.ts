import { LlmError, type LlmMessage, type LlmRequest, type LlmResponse } from '@/shared/types/llm';
import { type ProviderConfig } from '@/shared/types/settings';

import { httpError } from './http';

const DEFAULT_MAX_TOKENS = 4096;

type ContentPart = { text: string } | { inline_data: { mime_type: string; data: string } };

interface GenerateContentResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

function toParts(message: LlmMessage): ContentPart[] {
  const parts: ContentPart[] = [{ text: message.content }];
  for (const { mediaType, dataBase64 } of message.images ?? []) {
    parts.push({ inline_data: { mime_type: mediaType, data: dataBase64 } });
  }
  return parts;
}

export async function callGemini(
  config: ProviderConfig,
  model: string,
  request: LlmRequest,
  provider: string,
): Promise<LlmResponse> {
  const { baseUrl, apiKey } = config;
  if (!apiKey) throw new LlmError('Add your Google Gemini API key in settings.', provider);

  const systemText = request.messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n');
  const contents = request.messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: toParts(message) }));

  const url = `${baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: request.signal,
    body: JSON.stringify({
      contents,
      systemInstruction: systemText ? { parts: [{ text: systemText }] } : undefined,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
      },
    }),
  });

  if (!response.ok) throw await httpError(response, provider);

  const data = (await response.json()) as GenerateContentResponse;
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? '')
    .join('');
  if (!text) throw new LlmError('Response did not contain any text content.', provider);
  return { text };
}
