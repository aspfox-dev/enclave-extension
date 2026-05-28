import { useState } from 'react';

import { AGENT_STATUS_LABELS, HISTORY_UI } from '@/shared/constants/strings';
import { type AgentResult } from '@/shared/types/agent';
import { type TaskHistoryEntry, type VerificationVerdict } from '@/shared/types/verification';

import { VerificationBadge } from '../agent/VerificationBadge';

interface HistoryEntryCardProps {
  entry: TaskHistoryEntry;
  onDelete: (id: string) => void;
}

const STATUS_COLOR: Record<AgentResult['status'], string> = {
  done: 'text-status-success',
  failed: 'text-status-error',
  stopped: 'text-status-warning',
};

const VERDICT_DOT: Record<VerificationVerdict, string> = {
  succeeded: 'bg-status-success',
  uncertain: 'bg-status-warning',
  failed: 'bg-status-error',
};

function formatTimestamp(value: number): string {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function durationLabel(startedAt: number, completedAt: number): string {
  const seconds = Math.max(0, Math.round((completedAt - startedAt) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
}

export function HistoryEntryCard({ entry, onDelete }: HistoryEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { id, goal, status, summary, startedAt, completedAt, steps, verification, screenshotDataUrl } = entry;
  const dot = verification ? VERDICT_DOT[verification.verdict] : 'bg-slate-600';

  return (
    <article className="flex flex-col gap-0 border-b border-surface-border py-2 last:border-b-0">
      <header className="flex items-start gap-2">
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-slate-100">{goal}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            <span className={STATUS_COLOR[status]}>{AGENT_STATUS_LABELS[status]}</span>
            {' · '}
            {formatTimestamp(completedAt)}
            {' · '}
            {steps.length} {steps.length === 1 ? HISTORY_UI.step : HISTORY_UI.stepsLabel}
            {' · '}
            {durationLabel(startedAt, completedAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:border-surface-borderStrong hover:text-slate-100"
          >
            {expanded ? HISTORY_UI.collapse : HISTORY_UI.expand}
          </button>
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:border-status-error/50 hover:text-status-error"
          >
            {HISTORY_UI.delete}
          </button>
        </div>
      </header>

      {expanded && (
        <div className="ml-3.5 mt-2 flex flex-col gap-2">
          {verification ? (
            <VerificationBadge verification={verification} />
          ) : (
            <p className="text-[11px] text-slate-500">{HISTORY_UI.unverified}</p>
          )}
          {summary && <p className="text-[12px] text-slate-300">{summary}</p>}
          {screenshotDataUrl ? (
            <img
              src={screenshotDataUrl}
              alt={`Final state of "${goal}"`}
              className="w-full rounded-md border border-surface-border"
            />
          ) : (
            <p className="text-[11px] text-slate-500">{HISTORY_UI.noScreenshot}</p>
          )}
        </div>
      )}
    </article>
  );
}
