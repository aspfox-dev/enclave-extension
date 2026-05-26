import { type ContentActionResult, type WorkflowEvent } from '@/shared/types/messaging';
import { type Workflow, type WorkflowStep } from '@/shared/types/workflow';
import { delay } from '@/shared/util/delay';

import { getActiveTabId, navigateTab, sendToContent } from '../tabs';

const PAUSE_POLL_MS = 200;
const NAV_SETTLE_MS = 1_500;

export interface ReplayContext {
  stepDelayMs: number;
  signal: AbortSignal;
  isPaused: () => boolean;
  emit: (event: WorkflowEvent) => void;
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new Error('Replay stopped.');
}

async function waitWhilePaused(ctx: ReplayContext): Promise<void> {
  while (ctx.isPaused()) {
    throwIfAborted(ctx.signal);
    await delay(PAUSE_POLL_MS);
  }
}

async function executeStep(tabId: number, step: WorkflowStep): Promise<void> {
  switch (step.kind) {
    case 'navigate':
      await navigateTab(tabId, step.url);
      await delay(NAV_SETTLE_MS);
      return;
    case 'click': {
      const result = await sendToContent<ContentActionResult>(tabId, {
        type: 'clickSelector',
        selector: step.selector,
      });
      if (!result.ok) throw new Error(result.detail);
      return;
    }
    case 'type': {
      const result = await sendToContent<ContentActionResult>(tabId, {
        type: 'typeSelector',
        selector: step.selector,
        text: step.text,
        submit: step.submit,
      });
      if (!result.ok) throw new Error(result.detail);
    }
  }
}

export async function runReplay(workflow: Workflow, ctx: ReplayContext): Promise<void> {
  const total = workflow.steps.length;
  if (total === 0) {
    ctx.emit({ type: 'replay', phase: 'done', index: 0, total: 0 });
    return;
  }

  const tabId = await getActiveTabId();
  ctx.emit({ type: 'replay', phase: 'running', index: 0, total });

  for (let index = 0; index < total; index += 1) {
    await waitWhilePaused(ctx);
    throwIfAborted(ctx.signal);

    ctx.emit({ type: 'replay', phase: 'running', index, total });
    await executeStep(tabId, workflow.steps[index]);

    if (index < total - 1) await delay(ctx.stepDelayMs, ctx.signal);
  }

  ctx.emit({ type: 'replay', phase: 'done', index: total, total });
}
