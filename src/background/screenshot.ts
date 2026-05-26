import { type LlmImage } from '@/shared/types/llm';

const DATA_URL_PATTERN = /^data:(.+);base64,(.+)$/;

function parseDataUrl(dataUrl: string): LlmImage {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) throw new Error('The screenshot data URL was malformed.');
  return { mediaType: match[1], dataBase64: match[2] };
}

export async function captureActiveTabImage(): Promise<LlmImage> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.windowId) throw new Error('No active window is available to capture.');

  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
  return parseDataUrl(dataUrl);
}
