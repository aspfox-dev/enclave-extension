import { runLlm } from '@/shared/llm/client';
import { type ChatTurn, type PageContext } from '@/shared/types/chat';
import { type LlmMessage } from '@/shared/types/llm';
import { type RuntimeRequest, type RuntimeResponse } from '@/shared/types/messaging';

type ChatAskRequest = Extract<RuntimeRequest, { type: 'chat:ask' }>;

import { captureCompressedTabImage } from '../screenshot';
import { getActiveTabId, sendToContent } from '../tabs';

const SYSTEM_PROMPT = `You are Enclave's page assistant. The user is reading a web page in their browser and is asking questions about it. The current page's title, URL, and visible text — and possibly a screenshot — are attached to their latest message. Answer using that context plus your general knowledge. Be concise and accurate; quote phrases from the page when it helps.`;

function withPageContext(latest: ChatTurn, page: PageContext): string {
  return `${latest.content}\n\n---\nCurrent page:\nTitle: ${page.title}\nURL: ${page.url}\n\n${page.text}`;
}

async function buildMessages(
  history: ChatTurn[],
  submode: 'quick' | 'pro',
  tabId: number,
): Promise<LlmMessage[]> {
  if (history.length === 0) throw new Error('There are no chat messages to send.');
  const latest = history[history.length - 1];
  if (latest.role !== 'user') throw new Error('The most recent chat turn must be from the user.');

  const page = await sendToContent<PageContext>(tabId, { type: 'pageText' });
  const previous: LlmMessage[] = history.slice(0, -1).map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));

  const userMessage: LlmMessage = { role: 'user', content: withPageContext(latest, page) };
  if (submode === 'pro') userMessage.images = [await captureCompressedTabImage()];

  return [{ role: 'system', content: SYSTEM_PROMPT }, ...previous, userMessage];
}

export async function handleChatAsk(request: ChatAskRequest): Promise<RuntimeResponse> {
  try {
    const tabId = await getActiveTabId();
    const messages = await buildMessages(request.history, request.submode, tabId);
    const slot = request.submode === 'pro' ? 'vision' : 'chat';
    const { text } = await runLlm(slot, { messages });
    return { ok: true, reply: text };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'The chat request failed.',
    };
  }
}
