import { type AgentAction, type AgentStep } from '@/shared/types/agent';
import { type InteractiveElement, type PageSnapshot } from '@/shared/types/dom';

const MAX_ELEMENTS = 80;
const MAX_HISTORY = 8;
const MAX_PROMPT_TEXT = 2_000;

const SYSTEM_PROMPT = `You are Enclave, an autonomous browser agent operating a real web page on the user's behalf.
Each turn you receive the user's goal, the current page, and a numbered list of interactive elements.
Choose exactly one next action and respond with a single JSON object and nothing else.

Action schema (pick one):
{"kind":"click","ref":<number>,"reason":"<short>"}
{"kind":"type","ref":<number>,"text":"<text>","submit":<boolean>,"reason":"<short>"}
{"kind":"scroll","direction":"up"|"down","reason":"<short>"}
{"kind":"navigate","url":"https://...","reason":"<short>"}
{"kind":"wait","reason":"<short>"}
{"kind":"done","summary":"<what was accomplished>"}
{"kind":"fail","summary":"<why it cannot be completed>"}

Rules:
- Only use refs that appear in the current element list.
- To search, type into the search field with submit:true rather than hunting for a button.
- Return "done" only when the goal is fully achieved, and "fail" when genuinely blocked.
- Keep every reason to one short sentence.`;

const VISION_HINT = `\n\nA screenshot of the page is attached. Numbered markers correspond to the ref ids in the element list — use them to pick the right element when the text alone is ambiguous.`;

const RAW_SYSTEM_PROMPT = `You are Enclave, an autonomous browser agent operating a real web page through synthetic mouse and keyboard input.
The DOM-based and overlay-based tiers failed for this page, so you must work directly from the screenshot.
Choose exactly one next action and respond with a single JSON object and nothing else.

Action schema (pick one):
{"kind":"rawClick","x":<number>,"y":<number>,"reason":"<short>"}
{"kind":"rawType","text":"<text>","submit":<boolean>,"reason":"<short>"}
{"kind":"scroll","direction":"up"|"down","reason":"<short>"}
{"kind":"navigate","url":"https://...","reason":"<short>"}
{"kind":"wait","reason":"<short>"}
{"kind":"done","summary":"<what was accomplished>"}
{"kind":"fail","summary":"<why it cannot be completed>"}

Rules:
- Coordinates are pixels in the attached screenshot, measured from its top-left corner.
- "rawType" types into whatever element you most recently clicked — click the input first, then type.
- Return "done" only when the goal is fully achieved, and "fail" when genuinely blocked.
- Keep every reason to one short sentence.`;

export interface PromptExtras {
  researchContext?: string;
  vault?: string;
  withVision?: boolean;
}

function appendExtras(base: string, extras: PromptExtras): string {
  let prompt = base;
  if (extras.researchContext) {
    prompt += `\n\nContext you should use while acting:\n${extras.researchContext}`;
  }
  if (extras.vault) {
    prompt += `\n\nUser information you may use to fill form fields when relevant:\n${extras.vault}`;
  }
  return prompt;
}

export function buildSystemPrompt(extras: PromptExtras = {}): string {
  const base = extras.withVision ? `${SYSTEM_PROMPT}${VISION_HINT}` : SYSTEM_PROMPT;
  return appendExtras(base, extras);
}

export function buildRawSystemPrompt(extras: PromptExtras = {}): string {
  return appendExtras(RAW_SYSTEM_PROMPT, extras);
}

function elementLine({ ref, kind, text, ariaLabel, placeholder, value }: InteractiveElement): string {
  const label = text || ariaLabel || placeholder || value || '(no label)';
  return `[${ref}] ${kind} "${label}"`;
}

function historyLines(steps: AgentStep[]): string {
  if (steps.length === 0) return 'None yet.';
  return steps
    .slice(-MAX_HISTORY)
    .map((step) => `${step.index + 1}. ${step.action.kind} — ${step.succeeded ? 'ok' : 'failed'}: ${step.detail}`)
    .join('\n');
}

export function buildStepPrompt(goal: string, snapshot: PageSnapshot, steps: AgentStep[]): string {
  const elements = snapshot.elements.slice(0, MAX_ELEMENTS).map(elementLine).join('\n');
  return [
    `Goal: ${goal}`,
    `Page: ${snapshot.title} — ${snapshot.url}`,
    `Visible text (truncated):\n${snapshot.text.slice(0, MAX_PROMPT_TEXT)}`,
    `Interactive elements:\n${elements || '(none detected)'}`,
    `Recent actions:\n${historyLines(steps)}`,
    'Respond with the next action as a single JSON object.',
  ].join('\n\n');
}

export function buildRawStepPrompt(
  goal: string,
  snapshot: PageSnapshot,
  steps: AgentStep[],
  imageWidth: number,
  imageHeight: number,
): string {
  return [
    `Goal: ${goal}`,
    `Screenshot: ${imageWidth} × ${imageHeight} pixels.`,
    `Page: ${snapshot.title} — ${snapshot.url}`,
    `Visible text (truncated):\n${snapshot.text.slice(0, MAX_PROMPT_TEXT)}`,
    `Recent actions:\n${historyLines(steps)}`,
    'Respond with the next action as a single JSON object.',
  ].join('\n\n');
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`The model's action was missing a numeric "${field}".`);
  }
  return value;
}

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : raw;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('The model did not return a JSON action.');
  return body.slice(start, end + 1);
}

export function parseAction(raw: string): AgentAction {
  const parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>;
  const { kind } = parsed;

  switch (kind) {
    case 'click':
      return { kind, ref: requireNumber(parsed.ref, 'ref'), reason: asString(parsed.reason) };
    case 'type':
      return {
        kind,
        ref: requireNumber(parsed.ref, 'ref'),
        text: asString(parsed.text),
        submit: Boolean(parsed.submit),
        reason: asString(parsed.reason),
      };
    case 'scroll':
      return { kind, direction: parsed.direction === 'up' ? 'up' : 'down', reason: asString(parsed.reason) };
    case 'navigate':
      return { kind, url: asString(parsed.url), reason: asString(parsed.reason) };
    case 'wait':
      return { kind, reason: asString(parsed.reason) };
    case 'rawClick':
      return {
        kind,
        x: requireNumber(parsed.x, 'x'),
        y: requireNumber(parsed.y, 'y'),
        reason: asString(parsed.reason),
      };
    case 'rawType':
      return {
        kind,
        text: asString(parsed.text),
        submit: Boolean(parsed.submit),
        reason: asString(parsed.reason),
      };
    case 'done':
      return { kind, summary: asString(parsed.summary) };
    case 'fail':
      return { kind, summary: asString(parsed.summary) };
    default:
      throw new Error(`The model returned an unknown action kind: ${String(kind)}.`);
  }
}
