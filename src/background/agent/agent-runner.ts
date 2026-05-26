import { type AgentResult, type AgentStep, type AgentTier } from '@/shared/types/agent';
import { type PageSnapshot } from '@/shared/types/dom';
import { type AgentEvent } from '@/shared/types/messaging';
import { type AgentLimits, type FeatureFlags } from '@/shared/types/settings';
import { delay } from '@/shared/util/delay';

import { sendToContent } from '../tabs';
import { type ExecutionContext, executeAction } from './action-executor';
import { LoopGuard } from './loop-guard';
import { CdpInputController } from './raw-input';
import { chooseAction } from './tier-strategy';

const PAUSE_POLL_MS = 300;
const MAX_TIER: AgentTier = 4;

export interface RunnerContext {
  goal: string;
  tabId: number;
  limits: AgentLimits;
  features: FeatureFlags;
  signal: AbortSignal;
  isPaused: () => boolean;
  emit: (event: AgentEvent) => void;
  researchContext?: string;
  vault?: string;
}

function settled(status: AgentResult['status'], summary: string, steps: AgentStep[]): AgentResult {
  return { status, summary, steps };
}

function nextTier(tier: AgentTier): AgentTier {
  return Math.min(MAX_TIER, tier + 1) as AgentTier;
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new Error('Agent run stopped.');
}

async function waitWhilePaused(ctx: RunnerContext): Promise<void> {
  while (ctx.isPaused()) {
    throwIfAborted(ctx.signal);
    await delay(PAUSE_POLL_MS);
  }
}

export async function runAgent(ctx: RunnerContext): Promise<AgentResult> {
  const steps: AgentStep[] = [];
  const guard = new LoopGuard();
  const deadline = Date.now() + ctx.limits.wallTimeoutMs;
  let tier: AgentTier = 1;
  let rawInput: CdpInputController | null = null;

  try {
    for (let index = 0; index < ctx.limits.maxSteps; index += 1) {
      await waitWhilePaused(ctx);
      throwIfAborted(ctx.signal);
      if (Date.now() > deadline) {
        return settled('failed', 'Stopped: the overall time limit was reached.', steps);
      }

      const snapshot = await sendToContent<PageSnapshot>(ctx.tabId, { type: 'extract' });
      const action = await chooseAction({
        tier,
        goal: ctx.goal,
        researchContext: ctx.researchContext,
        vault: ctx.vault,
        snapshot,
        steps,
        signal: ctx.signal,
      });

      if (action.kind === 'done') return settled('done', action.summary, steps);
      if (action.kind === 'fail') return settled('failed', action.summary, steps);

      ctx.emit({ type: 'log', level: 'info', message: action.reason });

      const execCtx: ExecutionContext = {
        tabId: ctx.tabId,
        pixelRatio: snapshot.viewport.pixelRatio,
        rawInput: rawInput ?? undefined,
      };
      const outcome = await executeAction(execCtx, action);
      const step: AgentStep = { index, action, succeeded: outcome.succeeded, detail: outcome.detail };
      steps.push(step);
      ctx.emit({ type: 'step', step });

      const verdict = guard.observe(action, snapshot.stateHash);
      const shouldEscalate = !outcome.succeeded || verdict.looping;

      if (shouldEscalate) {
        const canEscalate = ctx.features.visionEscalation && tier < MAX_TIER;
        if (!canEscalate) {
          const reason = verdict.looping
            ? `Stopped because the agent ${verdict.reason}.`
            : `Stopped: ${outcome.detail}`;
          return settled('failed', reason, steps);
        }
        tier = nextTier(tier);
        guard.reset();
        if (tier === MAX_TIER && !rawInput) rawInput = new CdpInputController(ctx.tabId);
      }

      await delay(ctx.limits.stepDelayMs, ctx.signal);
    }
    return settled('failed', 'Stopped: reached the maximum number of steps.', steps);
  } finally {
    if (rawInput) {
      try {
        await rawInput.detach();
      } catch (cleanupError) {
        const message = cleanupError instanceof Error ? cleanupError.message : 'unknown error';
        ctx.emit({ type: 'log', level: 'error', message: `Could not detach the debugger: ${message}` });
      }
    }
  }
}
