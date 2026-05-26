import { type ResearchReport } from '@/shared/types/research';
import { htmlToDataUrl } from '@/shared/util/data-url';
import { delay } from '@/shared/util/delay';

import { waitForTabLoad } from '../tabs';

const GOOGLE_SEARCH_URL = 'https://www.google.com/search?q=';
const POST_LOAD_SETTLE_MS = 1_500;

export async function openSearchTab(topic: string): Promise<number> {
  const tab = await chrome.tabs.create({
    url: `${GOOGLE_SEARCH_URL}${encodeURIComponent(topic)}`,
  });
  if (!tab.id) throw new Error('Could not create a working tab for the research run.');

  await waitForTabLoad(tab.id);
  await delay(POST_LOAD_SETTLE_MS);
  return tab.id;
}

export async function openReportTab(report: ResearchReport): Promise<void> {
  await chrome.tabs.create({ url: htmlToDataUrl(report.html) });
}

export async function closeTab(tabId: number): Promise<void> {
  try {
    await chrome.tabs.remove(tabId);
  } catch {
    // Tab may already be gone; nothing meaningful to do in cleanup.
  }
}
