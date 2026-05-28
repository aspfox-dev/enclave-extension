import { runLlm } from '@/shared/llm/client';
import { type AgentAction, type AgentStep, type AgentTier } from '@/shared/types/agent';
import { type PageSnapshot } from '@/shared/types/dom';

import { captureCompressedTabImage } from '../screenshot';
import { annotateScreenshot } from './overlay';
import {
  buildRawStepPrompt,
  buildRawSystemPrompt,
  buildStepPrompt,
  buildSystemPrompt,
  parseAction,
} from './prompt';

const TIER_MARK_COUNT: Record<2 | 3, number> = { 2: 80, 3: 160 };

export interface ChooseActionParams {
  tier: AgentTier;
  goal: string;
  researchContext?: string;
  memories?: string;
  vault?: string;
  snapshot: PageSnapshot;
  steps: AgentStep[];
  signal: AbortSignal;
}

export async function chooseAction(params: ChooseActionParams): Promise<AgentAction> {
  switch (params.tier) {
    case 1:
      return chooseDomAction(params);
    case 4:
      return chooseRawAction(params);
    default:
      return chooseVisionAction(params, TIER_MARK_COUNT[params.tier]);
  }
}

async function chooseDomAction(params: ChooseActionParams): Promise<AgentAction> {
  const system = buildSystemPrompt({
    researchContext: params.researchContext,
    memories: params.memories,
    vault: params.vault,
  });
  const user = buildStepPrompt(params.goal, params.snapshot, params.steps);
  const { text } = await runLlm('agent', {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0,
    signal: params.signal,
  });
  return parseAction(text);
}

async function chooseVisionAction(params: ChooseActionParams, markCount: number): Promise<AgentAction> {
  const screenshot = await captureCompressedTabImage();
  const marked = params.snapshot.elements.slice(0, markCount);
  const image = await annotateScreenshot(screenshot, marked, params.snapshot.viewport.pixelRatio);

  const system = buildSystemPrompt({
    researchContext: params.researchContext,
    memories: params.memories,
    vault: params.vault,
    withVision: true,
  });
  const user = buildStepPrompt(params.goal, params.snapshot, params.steps);
  const { text } = await runLlm('vision', {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user, images: [image] },
    ],
    temperature: 0,
    signal: params.signal,
  });
  return parseAction(text);
}

async function chooseRawAction(params: ChooseActionParams): Promise<AgentAction> {
  const screenshot = await captureCompressedTabImage();
  const { width, height, pixelRatio } = params.snapshot.viewport;
  const system = buildRawSystemPrompt({
    researchContext: params.researchContext,
    memories: params.memories,
    vault: params.vault,
  });
  const user = buildRawStepPrompt(
    params.goal,
    params.snapshot,
    params.steps,
    width * pixelRatio,
    height * pixelRatio,
  );
  const { text } = await runLlm('vision', {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user, images: [screenshot] },
    ],
    temperature: 0,
    signal: params.signal,
  });
  return parseAction(text);
}
