import { saveReport } from '@/shared/storage/research-store';
import { type ResearchEvent } from '@/shared/types/messaging';
import { type ResearchReport, type ResearchSource } from '@/shared/types/research';
import { withTimeout } from '@/shared/util/timeout';

import { sendToContent } from '../tabs';
import { captureAiOverview } from './ai-overview';
import { buildReportHtml } from './report-builder';
import { fetchSource } from './source-fetcher';
import { summarizeSource } from './summarizer';
import { synthesizeReport } from './synthesizer';
import { closeTab, openReportTab, openSearchTab } from './working-tab';

const PER_SOURCE_TIMEOUT_MS = 60_000;
const LLM_TIMEOUT_MS = 45_000;

export interface ResearchRunnerContext {
  topic: string;
  signal: AbortSignal;
  emit: (event: ResearchEvent) => void;
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new Error('Research run stopped.');
}

function withLlmDeadline(signal: AbortSignal): AbortSignal {
  return AbortSignal.any([signal, AbortSignal.timeout(LLM_TIMEOUT_MS)]);
}

async function attemptOverview(signal: AbortSignal): Promise<string | undefined> {
  try {
    return await captureAiOverview(withLlmDeadline(signal));
  } catch {
    // AI Overview is best-effort enrichment; skip on any failure.
    return undefined;
  }
}

async function processSource(
  topic: string,
  tabId: number,
  url: string,
  signal: AbortSignal,
): Promise<ResearchSource> {
  return withTimeout(
    async (timeoutSignal) => {
      const combined = AbortSignal.any([signal, timeoutSignal]);
      const fetched = await fetchSource(tabId, url);
      const summary = await summarizeSource(topic, fetched, withLlmDeadline(combined));
      return {
        url,
        title: fetched.page.title || url,
        status: 'done',
        summary,
      } satisfies ResearchSource;
    },
    PER_SOURCE_TIMEOUT_MS,
    'Source timed out after 60 seconds.',
  );
}

export async function runResearch(ctx: ResearchRunnerContext): Promise<ResearchReport> {
  const { topic, signal, emit } = ctx;
  let tabId: number | null = null;

  try {
    emit({ type: 'phase', phase: 'searching' });
    tabId = await openSearchTab(topic);
    throwIfAborted(signal);

    const aiOverview = await attemptOverview(signal);
    if (aiOverview) emit({ type: 'overview', text: aiOverview });
    throwIfAborted(signal);

    const urls = await sendToContent<string[]>(tabId, { type: 'serpUrls' });
    if (urls.length === 0) {
      throw new Error('Google returned no organic results that Enclave could read.');
    }

    const sources: ResearchSource[] = urls.map((url) => ({ url, title: '', status: 'pending' }));
    emit({ type: 'sources', sources });

    emit({ type: 'phase', phase: 'reading' });
    for (let index = 0; index < sources.length; index += 1) {
      throwIfAborted(signal);

      sources[index] = { ...sources[index], status: 'active' };
      emit({ type: 'source', index, source: sources[index] });

      try {
        sources[index] = await processSource(topic, tabId, sources[index].url, signal);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to read this source.';
        sources[index] = { ...sources[index], status: 'error', error: message };
      }
      emit({ type: 'source', index, source: sources[index] });
    }

    throwIfAborted(signal);
    emit({ type: 'phase', phase: 'synthesizing' });
    const conclusion = await synthesizeReport(topic, sources, aiOverview, withLlmDeadline(signal));

    const createdAt = Date.now();
    const html = buildReportHtml({ topic, createdAt, sources, conclusion, aiOverview });
    const report: ResearchReport = {
      id: crypto.randomUUID(),
      topic,
      createdAt,
      html,
      conclusion,
      sources,
      aiOverview,
    };

    await saveReport(report);
    await openReportTab(report);
    emit({ type: 'phase', phase: 'done' });
    return report;
  } finally {
    if (tabId !== null && signal.aborted) await closeTab(tabId);
  }
}
