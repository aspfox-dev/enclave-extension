import { HISTORY_UI } from '@/shared/constants/strings';

import { useTaskHistory } from '../../hooks/useTaskHistory';
import { HistoryEntryCard } from './HistoryEntryCard';

export function HistoryPanel() {
  const { entries, remove, clear } = useTaskHistory();

  function handleDelete(id: string) {
    void remove(id);
  }

  function handleClear() {
    if (!window.confirm(HISTORY_UI.clearConfirm)) return;
    void clear();
  }

  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden border-t border-surface-border">
        {entries.length > 0 && (
          <div className="shrink-0 flex justify-end px-4 pt-3">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:border-status-error/50 hover:text-status-error"
            >
              {HISTORY_UI.clearAll}
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {entries.length === 0 ? (
            <p className="text-[12px] text-slate-500">{HISTORY_UI.empty}</p>
          ) : (
            <ul>
              {entries.map((entry) => (
                <li key={entry.id}>
                  <HistoryEntryCard entry={entry} onDelete={handleDelete} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
