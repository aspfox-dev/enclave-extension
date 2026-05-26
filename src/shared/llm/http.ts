import { LlmError } from '@/shared/types/llm';

const MAX_ERROR_BODY = 500;

async function readBody(response: Response): Promise<string> {
  try {
    const body = await response.text();
    return body.slice(0, MAX_ERROR_BODY);
  } catch {
    return '';
  }
}

export async function httpError(response: Response, provider: string): Promise<LlmError> {
  const body = await readBody(response);
  const detail = body ? ` — ${body}` : '';
  return new LlmError(
    `${provider} request failed (${response.status} ${response.statusText})${detail}`,
    provider,
  );
}
