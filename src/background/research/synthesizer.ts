import { runLlm } from '@/shared/llm/client';
import { type ResearchSource } from '@/shared/types/research';

const SYSTEM_PROMPT = `You are writing the final synthesis section of a research report.
You will be given summaries of several sources about a single topic.
Write 2 to 4 short paragraphs that combine the consistent findings, call out disagreements between sources, and note anything notable.
Stay factual; do not speculate beyond the sources. Plain text, no markdown headers.`;

function buildUserPrompt(topic: string, sources: ResearchSource[], aiOverview?: string): string {
  const lines: string[] = [`Topic: ${topic}`];
  if (aiOverview) lines.push(`Google AI overview:\n${aiOverview}`);

  const usableSources = sources.filter((source) => source.status === 'done' && source.summary);
  lines.push('Source summaries:');
  for (const [index, source] of usableSources.entries()) {
    lines.push(`(${index + 1}) ${source.title} — ${source.url}\n${source.summary}`);
  }
  return lines.join('\n\n');
}

export async function synthesizeReport(
  topic: string,
  sources: ResearchSource[],
  aiOverview: string | undefined,
  signal: AbortSignal,
): Promise<string> {
  const { text } = await runLlm('research', {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(topic, sources, aiOverview) },
    ],
    temperature: 0.3,
    signal,
  });
  return text.trim();
}
