import { runLlm } from '@/shared/llm/client';
import { type AgentResult, type AgentStep } from '@/shared/types/agent';
import { type MemoryEntry } from '@/shared/types/memory';

const SYSTEM_PROMPT = `You distill what's worth remembering from a completed browser-agent task.
Return 3 to 5 short bullet points capturing user preferences, key facts the agent learned, or outcomes that will help in future runs on similar tasks.
Use plain text bullets (one per line, each starting with "- "). Keep each bullet under 120 characters and avoid restating the goal verbatim.
If nothing worth remembering was learned, respond with exactly: NOTHING.`;

const MAX_FACTS = 5;
const MAX_STEPS_IN_PROMPT = 10;
const MAX_RELEVANT = 5;
const MIN_TOKEN_LENGTH = 4;

// Common filler words long enough to slip past the length filter but too generic
// to drive a useful overlap score.
const STOPWORDS = new Set([
  'this',
  'that',
  'with',
  'from',
  'what',
  'when',
  'your',
  'have',
  'into',
  'then',
  'them',
  'they',
  'were',
  'will',
  'would',
  'could',
  'should',
  'their',
  'there',
  'where',
  'about',
  'after',
  'before',
  'please',
  'using',
  'between',
]);

export interface FactExtractionInput {
  goal: string;
  status: AgentResult['status'];
  summary: string;
  steps: AgentStep[];
  signal: AbortSignal;
}

export async function extractFactsForTask(input: FactExtractionInput): Promise<string[]> {
  const { text } = await runLlm('research', {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildExtractionPrompt(input) },
    ],
    temperature: 0.2,
    signal: input.signal,
  });
  return parseFacts(text);
}

function stepHighlight(step: AgentStep): string {
  const { action } = step;
  const reason = 'reason' in action ? action.reason : action.summary;
  return `${step.index + 1}. ${action.kind}${step.succeeded ? '' : ' (failed)'} — ${reason}`;
}

function buildExtractionPrompt({ goal, status, summary, steps }: FactExtractionInput): string {
  const lines: string[] = [`Goal: ${goal}`, `Outcome: ${status} — ${summary}`];
  if (steps.length > 0) {
    const highlights = steps.slice(-MAX_STEPS_IN_PROMPT).map(stepHighlight).join('\n');
    lines.push(`Step highlights:\n${highlights}`);
  }
  lines.push('Respond with up to 5 bullets, one fact per line.');
  return lines.join('\n\n');
}

function parseFacts(raw: string): string[] {
  const trimmed = raw.trim();
  if (/^NOTHING\b/i.test(trimmed)) return [];

  return trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*•]/.test(line))
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, MAX_FACTS);
}

export function memoryEntriesFromFacts(facts: string[], goal: string): MemoryEntry[] {
  const createdAt = Date.now();
  return facts.map((fact) => ({
    id: crypto.randomUUID(),
    fact,
    createdAt,
    sourceGoal: goal,
  }));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(token));
}

function overlapScore(goalTokens: string[], fact: string): number {
  const factLower = fact.toLowerCase();
  let score = 0;
  for (const token of goalTokens) if (factLower.includes(token)) score += 1;
  return score;
}

export function selectRelevantMemories(goal: string, memories: MemoryEntry[]): MemoryEntry[] {
  const tokens = tokenize(goal);
  if (tokens.length === 0 || memories.length === 0) return [];

  return memories
    .map((memory) => ({ memory, score: overlapScore(tokens, memory.fact) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RELEVANT)
    .map((entry) => entry.memory);
}

export function formatMemoriesForPrompt(memories: MemoryEntry[]): string {
  if (memories.length === 0) return '';
  return memories.map((memory) => `- ${memory.fact}`).join('\n');
}
