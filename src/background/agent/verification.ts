import { runLlm } from '@/shared/llm/client';
import { type LlmImage } from '@/shared/types/llm';
import {
  type TaskSnapshot,
  type TaskVerification,
  type VerificationConfidence,
  type VerificationVerdict,
} from '@/shared/types/verification';

const CONFIRMATION_KEYWORDS =
  /\b(thank you|thanks|order(?:ed)? (?:placed|confirmed)|confirmed|success(?:ful)?|added to (?:cart|bag|basket)|booked|reservation|submitted|registered|signed up|enrolled|subscribed|completed|payment received)\b/i;

const SYSTEM_PROMPT = `You verify whether a browser agent completed its goal.
The attached screenshot is the page state where the agent stopped.
Respond with a single JSON object and nothing else, matching this exact shape:
{"verdict":"succeeded"|"uncertain"|"failed","confidence":"high"|"medium"|"low","explanation":"<one short sentence>"}

Use "succeeded" when the screenshot clearly shows the goal is met, "failed" when it plainly is not, and "uncertain" when the evidence is partial or ambiguous.
Pick "high" / "medium" / "low" based on how clear the visual evidence is.
Keep the explanation to one sentence; do not start it with "verdict" or restate the JSON keys.`;

export interface VerifyInput {
  goal: string;
  status: 'done' | 'failed' | 'stopped';
  summary: string;
  before: TaskSnapshot;
  after: TaskSnapshot;
  screenshot?: LlmImage;
  visionConfigured: boolean;
  signal: AbortSignal;
}

export async function verifyTask(input: VerifyInput): Promise<TaskVerification> {
  if (input.screenshot && input.visionConfigured) {
    try {
      return await verifyWithVision(input, input.screenshot);
    } catch {
      // Vision is best-effort — any failure (bad key, timeout, malformed reply)
      // drops us into the DOM heuristic so the user still gets a badge.
    }
  }
  return verifyWithDom(input);
}

function buildUserPrompt(input: VerifyInput): string {
  const { goal, before, after } = input;
  return [
    `Goal: ${goal}`,
    `Before — URL: ${before.url} · Title: ${before.title}`,
    `After — URL: ${after.url} · Title: ${after.title}`,
    `Agent's own summary: ${input.summary || '(none)'}`,
    'Decide from the attached screenshot and respond with the JSON object only.',
  ].join('\n');
}

async function verifyWithVision(input: VerifyInput, screenshot: LlmImage): Promise<TaskVerification> {
  const { text } = await runLlm('vision', {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(input), images: [screenshot] },
    ],
    temperature: 0,
    signal: input.signal,
  });
  return parseVerification(text);
}

function verifyWithDom(input: VerifyInput): TaskVerification {
  const { status, summary, before, after } = input;

  if (status === 'stopped') {
    return {
      verdict: 'failed',
      confidence: 'high',
      explanation: 'You stopped the run before it finished.',
      method: 'dom',
    };
  }

  if (status === 'failed') {
    return {
      verdict: 'failed',
      confidence: 'high',
      explanation: summary || 'The agent gave up before completing the goal.',
      method: 'dom',
    };
  }

  const urlChanged = before.url !== after.url;
  const confirmation = CONFIRMATION_KEYWORDS.exec(after.textPreview)?.[0];

  if (urlChanged && confirmation) {
    return {
      verdict: 'succeeded',
      confidence: 'high',
      explanation: `Page changed and now shows "${confirmation}".`,
      method: 'dom',
    };
  }

  if (urlChanged) {
    return {
      verdict: 'succeeded',
      confidence: 'medium',
      explanation: `Page navigated to "${after.title || after.url}".`,
      method: 'dom',
    };
  }

  if (confirmation) {
    return {
      verdict: 'succeeded',
      confidence: 'medium',
      explanation: `The page mentions "${confirmation}".`,
      method: 'dom',
    };
  }

  return {
    verdict: 'uncertain',
    confidence: 'low',
    explanation: 'No URL change or confirmation text was detected.',
    method: 'dom',
  };
}

const VERDICTS: readonly VerificationVerdict[] = ['succeeded', 'uncertain', 'failed'];
const CONFIDENCES: readonly VerificationConfidence[] = ['high', 'medium', 'low'];

function isVerdict(value: unknown): value is VerificationVerdict {
  return typeof value === 'string' && (VERDICTS as readonly string[]).includes(value);
}

function isConfidence(value: unknown): value is VerificationConfidence {
  return typeof value === 'string' && (CONFIDENCES as readonly string[]).includes(value);
}

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : raw;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('The verification model did not return JSON.');
  return body.slice(start, end + 1);
}

function parseVerification(raw: string): TaskVerification {
  const parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>;
  const { verdict, confidence, explanation } = parsed;

  if (!isVerdict(verdict)) throw new Error('Verification response was missing a valid "verdict".');
  if (!isConfidence(confidence)) throw new Error('Verification response was missing a valid "confidence".');

  return {
    verdict,
    confidence,
    explanation: typeof explanation === 'string' ? explanation.trim() : '',
    method: 'vision',
  };
}
