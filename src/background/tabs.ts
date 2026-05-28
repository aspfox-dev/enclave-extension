import { type ContentReply, type ContentRequest } from '@/shared/types/messaging';

const NAVIGATION_TIMEOUT_MS = 30_000;
/**
 * Milliseconds to wait after a tab reaches 'complete' before assuming the content
 * script is ready. 'document_idle' fires after DOMContentLoaded and a short idle
 * period; 800 ms covers heavy pages reliably while keeping latency low.
 */
const CONTENT_SCRIPT_READY_MS = 800;

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

/**
 * Waits until the tab has finished loading and the content script has had time to
 * inject. Safe against the race where the page completes between a status check
 * and listener registration: the listener is registered first, then the current
 * status is checked so the 'complete' event can never be missed.
 */
export function waitForTabReady(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      // Grace period for content script injection after the load event.
      setTimeout(resolve, CONTENT_SCRIPT_READY_MS);
    };

    const bail = (reason: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      reject(new Error(reason));
    };

    const onUpdated = (id: number, info: chrome.tabs.TabChangeInfo) => {
      if (id === tabId && info.status === 'complete') finish();
    };

    const timer = setTimeout(
      () => bail('The page took too long to finish loading.'),
      NAVIGATION_TIMEOUT_MS,
    );

    // Register the listener BEFORE reading status to avoid missing the event.
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        bail(chrome.runtime.lastError?.message ?? 'Tab not found.');
        return;
      }
      // If the page is already complete, resolve immediately (+ grace period).
      if (tab.status === 'complete') finish();
    });
  });
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
