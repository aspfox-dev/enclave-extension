import { RESEARCH_STATUS_LABELS, RESEARCH_UI } from '@/shared/constants/strings';
import { type ResearchSource, type SourceStatus } from '@/shared/types/research';

interface SourceListProps {
  sources: ResearchSource[];
  aiOverview: string | null;
  error: string | null;
}

const STATUS_BORDER: Record<SourceStatus, string> = {
  pending: 'border-surface-borderStrong',
  active: 'border-accent/60',
  done: 'border-status-success/50',
  error: 'border-status-error/50',
  skipped: 'border-status-warning/40',
};

const STATUS_LABEL_COLOR: Record<SourceStatus, string> = {
  pending: 'text-slate-600',
  active: 'text-accent',
  done: 'text-status-success',
  error: 'text-status-error',
  skipped: 'text-status-warning',
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
    return <p className="text-[12px] text-slate-500">{RESEARCH_UI.emptySources}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {aiOverview && (
        <div className="mb-2 border-l-2 border-accent/50 pl-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {RESEARCH_UI.overviewLabel}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-slate-300">
            {aiOverview}
          </p>
        </div>
      )}

      {sources.map((source, index) => (
        <div
          key={`${index}-${source.url}`}
          className={`border-l-2 pl-3 py-2 ${STATUS_BORDER[source.status]}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 flex-1 truncate text-[12px] text-slate-200">
              {source.title || hostFor(source.url)}
            </span>
            <span
              className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide ${STATUS_LABEL_COLOR[source.status]}`}
            >
              {RESEARCH_STATUS_LABELS[source.status]}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">{hostFor(source.url)}</p>
          {source.status === 'error' && source.error && (
            <p className="mt-0.5 text-[11px] text-status-error">{source.error}</p>
          )}
        </div>
      ))}

      {error && (
        <div className="border-l-2 border-status-error/60 pl-3 py-2">
          <p className="text-[12px] text-status-error">{error}</p>
        </div>
      )}
    </div>
  );
}
