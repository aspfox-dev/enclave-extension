import { type LlmImage } from '@/shared/types/llm';

const DATA_URL_PATTERN = /^data:(.+);base64,(.+)$/;
const COMPRESSED_JPEG_QUALITY = 70;

export function dataUrlToLlmImage(dataUrl: string): LlmImage {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) throw new Error('The screenshot data URL was malformed.');
  return { mediaType: match[1], dataBase64: match[2] };
}

async function captureActiveWindow(options: chrome.tabs.CaptureVisibleTabOptions): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.windowId) throw new Error('No active window is available to capture.');
  return chrome.tabs.captureVisibleTab(tab.windowId, options);
}

export async function captureActiveTabImage(): Promise<LlmImage> {
  return dataUrlToLlmImage(await captureActiveWindow({ format: 'png' }));
}

export async function captureCompressedTabDataUrl(): Promise<string> {
  return captureActiveWindow({ format: 'jpeg', quality: COMPRESSED_JPEG_QUALITY });
}

/** JPEG-compressed screenshot for vision LLM requests — significantly smaller than PNG. */
export async function captureCompressedTabImage(): Promise<LlmImage> {
  return dataUrlToLlmImage(await captureActiveWindow({ format: 'jpeg', quality: COMPRESSED_JPEG_QUALITY }));
}
