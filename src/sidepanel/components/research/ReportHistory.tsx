import { RESEARCH_UI } from '@/shared/constants/strings';
import { type ResearchReport } from '@/shared/types/research';

interface ReportHistoryProps {
  history: ResearchReport[];
  onOpen: (report: ResearchReport) => void;
  onRemove: (id: string) => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ReportHistory({ history, onOpen, onRemove }: ReportHistoryProps) {
  return (
    <section className="shrink-0 border-t border-surface-border pt-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {RESEARCH_UI.historyHeading}
      </p>
      {history.length === 0 ? (
        <p className="text-[12px] text-slate-500">{RESEARCH_UI.historyEmpty}</p>
      ) : (
        <ul className="flex flex-col gap-0">
          {history.map((report) => (
            <li
              key={report.id}
              className="flex items-center justify-between gap-2 border-b border-surface-border py-2 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] text-slate-200">{report.topic}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{formatDate(report.createdAt)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => onOpen(report)}
                  className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:border-surface-borderStrong hover:text-slate-100"
                >
                  {RESEARCH_UI.openReport}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(report.id)}
                  className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:border-status-error/50 hover:text-status-error"
                >
                  {RESEARCH_UI.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
