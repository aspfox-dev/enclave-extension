import { type PageContext } from '@/shared/types/chat';
import { type LlmImage } from '@/shared/types/llm';

import { captureActiveTabImage } from '../screenshot';
import { navigateTab, sendToContent } from '../tabs';

const LOW_TEXT_THRESHOLD = 200;

export interface FetchedSource {
  page: PageContext;
  fallbackImage?: LlmImage;
}

export async function fetchSource(tabId: number, url: string): Promise<FetchedSource> {
  await navigateTab(tabId, url);
  const page = await sendToContent<PageContext>(tabId, { type: 'pageText' });

  if (page.text.length >= LOW_TEXT_THRESHOLD) return { page };

  const fallbackImage = await captureActiveTabImage();
  return { page, fallbackImage };
}
