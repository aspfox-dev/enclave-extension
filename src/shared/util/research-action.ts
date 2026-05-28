import {
  type ResearchActionContext,
  type ResearchActionSource,
  type ResearchReport,
} from '@/shared/types/research';

const MAX_ACTION_SOURCES = 10;

export function buildActionContext(report: ResearchReport): ResearchActionContext {
  const sources: ResearchActionSource[] = report.sources
    .filter((source) => source.status === 'done' && source.summary)
    .slice(0, MAX_ACTION_SOURCES)
    .map((source) => ({
      title: source.title || source.url,
      url: source.url,
      summary: source.summary ?? '',
    }));

  return {
    topic: report.topic,
    conclusion: report.conclusion,
    aiOverview: report.aiOverview,
    sources,
  };
}

export function formatActionContext(context: ResearchActionContext): string {
  const lines: string[] = [
    'You have just finished researching this topic. Use the findings below as the source of truth while acting.',
    '',
    `Topic: ${context.topic}`,
    '',
    'Synthesized conclusion:',
    context.conclusion,
  ];

  if (context.aiOverview) {
    lines.push('', 'Google AI overview:', context.aiOverview);
  }

  if (context.sources.length > 0) {
    lines.push('', 'Source summaries:');
    context.sources.forEach((source, index) => {
      lines.push(`(${index + 1}) ${source.title} — ${source.url}`, source.summary);
    });
  }

  return lines.join('\n');
}
