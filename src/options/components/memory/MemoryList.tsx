import { MEMORY_UI } from '@/shared/constants/strings';
import { type MemoryEntry } from '@/shared/types/memory';

interface MemoryListProps {
  memories: MemoryEntry[];
  memoryEnabled: boolean;
  onDelete: (id: string) => void;
  onClear: () => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const GHOST_DESTRUCTIVE =
  'rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:border-status-error/50 hover:text-status-error';

export function MemoryList({ memories, memoryEnabled, onDelete, onClear }: MemoryListProps) {
  function handleClear() {
    if (!window.confirm(MEMORY_UI.clearConfirm)) return;
    onClear();
  }

  return (
    <section className="flex flex-col gap-5 border-t border-surface-border pt-6 mt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {MEMORY_UI.heading}
          </p>
          <p className="mt-1 text-[12px] text-slate-500">{MEMORY_UI.description}</p>
        </div>
        {memories.length > 0 && (
          <button type="button" onClick={handleClear} className={GHOST_DESTRUCTIVE}>
            {MEMORY_UI.clearAll}
          </button>
        )}
      </div>

      {!memoryEnabled && (
        <p className="text-[12px] text-status-warning">{MEMORY_UI.disabled}</p>
      )}

      {memories.length === 0 ? (
        <p className="text-[12px] text-slate-500">{MEMORY_UI.empty}</p>
      ) : (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {memories.length} {MEMORY_UI.count}
          </p>
          <ul className="flex flex-col">
            {memories.map((memory) => (
              <li
                key={memory.id}
                className="flex items-start justify-between gap-3 border-b border-surface-border py-2.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="text-[13px] text-slate-200">{memory.fact}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    From "{memory.sourceGoal}" · {formatDate(memory.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(memory.id)}
                  className={GHOST_DESTRUCTIVE}
                >
                  {MEMORY_UI.delete}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
