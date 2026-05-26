import { runLlm } from '@/shared/llm/client';

import { captureActiveTabImage } from '../screenshot';

const SYSTEM_PROMPT = `You are looking at a screenshot of a Google search results page.
If a Google AI Overview box appears near the top of the results, transcribe its text content faithfully (do not paraphrase or add commentary).
If there is no AI Overview on this page, respond with exactly: NONE`;

const NONE_TOKEN = 'NONE';

export async function captureAiOverview(signal: AbortSignal): Promise<string | undefined> {
  const screenshot = await captureActiveTabImage();
  const { text } = await runLlm('vision', {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: 'Check the attached screenshot for a Google AI Overview.',
        images: [screenshot],
      },
    ],
    temperature: 0,
    signal,
  });

  const trimmed = text.trim();
  if (!trimmed || trimmed.toUpperCase().startsWith(NONE_TOKEN)) return undefined;
  return trimmed;
}
