import { type ContentReply, type ContentRequest } from '@/shared/types/messaging';

const NAVIGATION_TIMEOUT_MS = 30_000;

export async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) throw new Error('No active tab is available for the agent to work in.');
  return tab.id;
}

export async function sendToContent<T>(tabId: number, request: ContentRequest): Promise<T> {
  let reply: ContentReply<T> | undefined;
  try {
    reply = (await chrome.tabs.sendMessage(tabId, request)) as ContentReply<T> | undefined;
  } catch {
    throw new Error('Enclave cannot reach this page. Reload the tab, or open a standard http(s) page, then retry.');
  }

  if (!reply) throw new Error('The page did not respond — it may still be loading.');
  if (!reply.ok) throw new Error(reply.error);
  return reply.data;
}

export async function navigateTab(tabId: number, url: string): Promise<void> {
  await chrome.tabs.update(tabId, { url });
  await waitForTabLoad(tabId);
}

export function waitForTabLoad(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
    const onUpdated = (updatedTabId: number, info: chrome.tabs.TabChangeInfo) => {
      if (updatedTabId === tabId && info.status === 'complete') {
        cleanup();
        resolve();
      }
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('The page took too long to finish loading.'));
    }, NAVIGATION_TIMEOUT_MS);

    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}
