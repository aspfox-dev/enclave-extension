import { runLlm } from '@/shared/llm/client';
import { type LlmImage, type LlmMessage } from '@/shared/types/llm';

import { type FetchedSource } from './source-fetcher';

const SYSTEM_PROMPT = `You are summarizing a single web page for a research report.
Return 3 to 5 short bullet points capturing the facts most relevant to the user's topic.
Use plain text bullets (one per line, starting with "- "). Be concise; quote phrases when useful.
If the page does not appear to contain relevant content, respond with exactly: NO_CONTENT.`;

const MAX_TEXT_FOR_PROMPT = 8_000;

function buildTextUser(topic: string, source: FetchedSource): string {
  const { page } = source;
  return [
    `Topic: ${topic}`,
    `Source: ${page.title} — ${page.url}`,
    'Page content:',
    page.text.slice(0, MAX_TEXT_FOR_PROMPT),
  ].join('\n\n');
}

function buildVisionUser(topic: string, source: FetchedSource): string {
  return [
    `Topic: ${topic}`,
    `Source: ${source.page.title} — ${source.page.url}`,
    'Plain-text extraction was thin — work from the attached screenshot of the page.',
  ].join('\n\n');
}

export async function summarizeSource(
  topic: string,
  source: FetchedSource,
  signal: AbortSignal,
): Promise<string> {
  if (source.fallbackImage) return summarizeViaVision(topic, source, source.fallbackImage, signal);
  return summarizeViaText(topic, source, signal);
}

async function summarizeViaText(topic: string, source: FetchedSource, signal: AbortSignal): Promise<string> {
  const messages: LlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildTextUser(topic, source) },
  ];
  const { text } = await runLlm('research', { messages, temperature: 0.2, signal });
  return text.trim();
}

async function summarizeViaVision(
  topic: string,
  source: FetchedSource,
  image: LlmImage,
  signal: AbortSignal,
): Promise<string> {
  const messages: LlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildVisionUser(topic, source), images: [image] },
  ];
  const { text } = await runLlm('vision', { messages, temperature: 0.2, signal });
  return text.trim();
}
