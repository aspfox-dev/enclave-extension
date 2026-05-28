import { useMemo, useState } from 'react';

import { COMMUNITY_UI } from '@/shared/constants/strings';
import { type CommunityWorkflow } from '@/shared/types/community';

import { useCommunityHub } from '../../hooks/useCommunityHub';

function workflowKey(workflow: CommunityWorkflow): string {
  return `${workflow.author}::${workflow.name}::${workflow.version}`;
}

function matchesQuery(workflow: CommunityWorkflow, query: string): boolean {
  if (!query) return true;
  const haystack = `${workflow.name} ${workflow.description} ${workflow.author}`.toLowerCase();
  return haystack.includes(query);
}

function stepCountLabel(count: number): string {
  return `${count} ${count === 1 ? COMMUNITY_UI.step : COMMUNITY_UI.stepsLabel}`;
}

function formatFetchedAt(timestamp: number | null): string {
  if (!timestamp) return COMMUNITY_UI.neverRefreshed;
  return `${COMMUNITY_UI.cacheLabel} ${new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export function CommunityHub() {
  const { workflows, loading, error, fetchedAt, refresh, importWorkflow } = useCommunityHub();
  const [query, setQuery] = useState('');
  const [importedKeys, setImportedKeys] = useState<Set<string>>(() => new Set());

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(
    () => workflows.filter((workflow) => matchesQuery(workflow, normalizedQuery)),
    [workflows, normalizedQuery],
  );

  async function handleImport(workflow: CommunityWorkflow) {
    const key = workflowKey(workflow);
    try {
      await importWorkflow(workflow);
      setImportedKeys((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
    } catch (importError) {
      console.warn('Enclave: could not import community workflow.', importError);
    }
  }

  return (
    <section className="flex flex-col gap-2 border-t border-surface-border pt-3">
      <header className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {COMMUNITY_UI.heading}
        </p>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:border-surface-borderStrong hover:text-slate-100 disabled:opacity-40"
        >
          {loading ? COMMUNITY_UI.refreshing : COMMUNITY_UI.refresh}
        </button>
      </header>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={COMMUNITY_UI.searchPlaceholder}
        className="w-full rounded-md border border-surface-border bg-surface-elevated px-3 py-2 text-[12px] text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
      />

      {error && (
        <div className="border-l-2 border-status-error/60 pl-3 py-2">
          <p className="text-[12px] text-status-error">{error}</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-[12px] text-slate-500">{COMMUNITY_UI.empty}</p>
      ) : (
        <ul className="flex flex-col gap-0">
          {filtered.map((workflow) => {
            const key = workflowKey(workflow);
            const alreadyImported = importedKeys.has(key);
            return (
              <li
                key={key}
                className="flex items-center justify-between gap-2 border-b border-surface-border py-2 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] text-slate-200">{workflow.name}</p>
                  {workflow.description && (
                    <p className="truncate text-[11px] text-slate-500">{workflow.description}</p>
                  )}
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                    {COMMUNITY_UI.byAuthor} {workflow.author} · {stepCountLabel(workflow.steps.length)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleImport(workflow)}
                  disabled={alreadyImported}
                  className="shrink-0 rounded-md bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {alreadyImported ? COMMUNITY_UI.imported : COMMUNITY_UI.import}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[10px] text-slate-600">{formatFetchedAt(fetchedAt)}</p>
    </section>
  );
}
