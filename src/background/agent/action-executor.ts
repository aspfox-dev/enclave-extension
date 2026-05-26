import { type AgentAction } from '@/shared/types/agent';
import { type ContentActionResult } from '@/shared/types/messaging';
import { delay } from '@/shared/util/delay';

import { navigateTab, sendToContent } from '../tabs';
import { type CdpInputController } from './raw-input';

const WAIT_SETTLE_MS = 1_500;

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
      const result = await sendToContent<ContentActionResult>(ctx.tabId, { type: 'click', ref: action.ref });
      return { succeeded: result.ok, detail: result.detail };
    }
    case 'type': {
      const result = await sendToContent<ContentActionResult>(ctx.tabId, {
        type: 'type',
        ref: action.ref,
        text: action.text,
        submit: action.submit,
      });
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
