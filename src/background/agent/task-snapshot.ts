import { type PageSnapshot } from '@/shared/types/dom';
import { type TaskSnapshot } from '@/shared/types/verification';

import { sendToContent } from '../tabs';

const TEXT_PREVIEW_LIMIT = 2_000;

function toTaskSnapshot(snapshot: PageSnapshot): TaskSnapshot {
  return {
    url: snapshot.url,
    title: snapshot.title,
    textPreview: snapshot.text.slice(0, TEXT_PREVIEW_LIMIT),
  };
}

export async function captureTaskSnapshot(tabId: number): Promise<TaskSnapshot> {
  return toTaskSnapshot(await sendToContent<PageSnapshot>(tabId, { type: 'extract' }));
}

export async function captureFinalSnapshot(
  tabId: number,
  fallback: TaskSnapshot,
): Promise<TaskSnapshot> {
  try {
    return await captureTaskSnapshot(tabId);
  } catch {
    // The page may have navigated to a protected URL where the content script
    // can't run. Fall back to whatever the tab itself can tell us.
  }

  try {
    const tab = await chrome.tabs.get(tabId);
    return {
      url: tab.url ?? fallback.url,
      title: tab.title ?? fallback.title,
      textPreview: '',
    };
  } catch {
    return fallback;
  }
}
