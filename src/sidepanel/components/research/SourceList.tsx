import { RESEARCH_STATUS_LABELS, RESEARCH_UI } from '@/shared/constants/strings';
import { type ResearchSource, type SourceStatus } from '@/shared/types/research';

interface SourceListProps {
  sources: ResearchSource[];
  aiOverview: string | null;
  error: string | null;
}

const STATUS_TONE: Record<SourceStatus, string> = {
  pending: 'text-slate-500',
  active: 'text-accent',
  done: 'text-emerald-300',
  error: 'text-red-300',
  skipped: 'text-amber-300',
};

function hostFor(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function SourceList({ sources, aiOverview, error }: SourceListProps) {
  if (sources.length === 0 && !aiOverview && !error) {
    return <p className="text-sm text-slate-500">{RESEARCH_UI.emptySources}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {aiOverview && (
        <div className="rounded-md border border-surface-border bg-surface-raised p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">{RESEARCH_UI.overviewLabel}</p>
          <p className="mt-1 whitespace-pre-wrap text-xs text-slate-300">{aiOverview}</p>
        </div>
      )}
      {sources.map((source, index) => (
        <div
          key={`${index}-${source.url}`}
          className="rounded-md border border-surface-border bg-surface-raised px-3 py-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-slate-200">{source.title || hostFor(source.url)}</span>
            <span className={`text-[11px] ${STATUS_TONE[source.status]}`}>
              {RESEARCH_STATUS_LABELS[source.status]}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">{hostFor(source.url)}</p>
          {source.status === 'error' && source.error && (
            <p className="mt-1 text-[11px] text-red-300">{source.error}</p>
          )}
        </div>
      ))}
      {error && (
        <div className="rounded-md border border-red-500/40 px-3 py-2 text-xs text-red-300">{error}</div>
      )}
    </div>
  );
}
