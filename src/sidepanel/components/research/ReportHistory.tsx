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
    <section className="flex flex-col gap-2 border-t border-surface-border pt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {RESEARCH_UI.historyHeading}
      </h3>
      {history.length === 0 ? (
        <p className="text-xs text-slate-500">{RESEARCH_UI.historyEmpty}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {history.map((report) => (
            <li
              key={report.id}
              className="flex items-center justify-between gap-2 rounded-md border border-surface-border bg-surface-raised px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-xs text-slate-200">{report.topic}</p>
                <p className="text-[10px] text-slate-500">{formatDate(report.createdAt)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => onOpen(report)}
                  className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-300 hover:border-accent hover:text-white"
                >
                  {RESEARCH_UI.openReport}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(report.id)}
                  className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-400 hover:border-red-500/60 hover:text-red-300"
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
