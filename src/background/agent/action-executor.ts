import { type AgentAction } from '@/shared/types/agent';
import { type ContentActionResult } from '@/shared/types/messaging';
import { delay } from '@/shared/util/delay';

import { navigateTab, sendToContent, waitForTabReady } from '../tabs';
import { type CdpInputController } from './raw-input';

const WAIT_SETTLE_MS = 1_500;
/**
 * How long to wait after a click/submit before checking whether a navigation
 * was triggered. Short enough to feel fast, long enough for JS navigation
 * handlers (e.g. Google's click tracker) to fire.
 */
const NAVIGATION_CHECK_DELAY_MS = 200;

async function getTabUrl(tabId: number): Promise<string | undefined> {
  try {
    const tab = await chrome.tabs.get(tabId);
    return tab.url;
  } catch {
    return undefined;
  }
}

/**
 * After actions that may trigger navigation (click, type-with-submit) call
 * this to transparently wait for the destination page to be ready. If no
 * navigation happened it returns almost immediately.
 */
async function awaitNavigationIfTriggered(tabId: number, urlBefore: string | undefined): Promise<void> {
  await delay(NAVIGATION_CHECK_DELAY_MS);
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  const navigated = !tab || tab.status === 'loading' || (tab.url && tab.url !== urlBefore);
  if (navigated) await waitForTabReady(tabId);
}

export interface ExecutionContext {
  tabId: number;
  pixelRatio: number;
  rawInput?: CdpInputController;
}

export interface ExecutionOutcome {
  succeeded: boolean;
  detail: string;
}

function noRawInput(): ExecutionOutcome {
  return { succeeded: false, detail: 'Raw input controller was not initialised for this tier.' };
}

export async function executeAction(ctx: ExecutionContext, action: AgentAction): Promise<ExecutionOutcome> {
  switch (action.kind) {
    case 'click': {
      const urlBefore = await getTabUrl(ctx.tabId);
      const result = await sendToContent<ContentActionResult>(ctx.tabId, { type: 'click', ref: action.ref });
      if (result.ok) await awaitNavigationIfTriggered(ctx.tabId, urlBefore);
      return { succeeded: result.ok, detail: result.detail };
    }
    case 'type': {
      const urlBefore = action.submit ? await getTabUrl(ctx.tabId) : undefined;
      const result = await sendToContent<ContentActionResult>(ctx.tabId, {
        type: 'type',
        ref: action.ref,
        text: action.text,
        submit: action.submit,
      });
      if (result.ok && action.submit) await awaitNavigationIfTriggered(ctx.tabId, urlBefore);
      return { succeeded: result.ok, detail: result.detail };
    }
    case 'scroll': {
      const result = await sendToContent<ContentActionResult>(ctx.tabId, {
        type: 'scroll',
        direction: action.direction,
      });
      return { succeeded: result.ok, detail: result.detail };
    }
    case 'navigate':
      await navigateTab(ctx.tabId, action.url);
      return { succeeded: true, detail: `Navigated to ${action.url}` };
    case 'wait':
      await delay(WAIT_SETTLE_MS);
      return { succeeded: true, detail: 'Waited for the page to settle' };
    case 'rawClick': {
      if (!ctx.rawInput) return noRawInput();
      await ctx.rawInput.click(action.x, action.y, ctx.pixelRatio);
      return { succeeded: true, detail: `Clicked at pixel (${action.x}, ${action.y})` };
    }
    case 'rawType': {
      if (!ctx.rawInput) return noRawInput();
      await ctx.rawInput.typeText(action.text, action.submit);
      return { succeeded: true, detail: `Typed${action.submit ? ' and submitted' : ''}` };
    }
    case 'done':
    case 'fail':
      return { succeeded: true, detail: action.summary };
  }
}
