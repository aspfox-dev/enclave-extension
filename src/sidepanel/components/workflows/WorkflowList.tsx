import { WORKFLOW_UI } from '@/shared/constants/strings';
import { type Workflow } from '@/shared/types/workflow';

import { type ReplayState } from '../../hooks/useWorkflowSession';
import { ReplayBanner } from './ReplayBanner';

interface WorkflowListProps {
  workflows: Workflow[];
  replay: ReplayState;
  onPlay: (id: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onDelete: (id: string) => void;
}

function stepLabel(count: number): string {
  return `${count} ${count === 1 ? WORKFLOW_UI.step : WORKFLOW_UI.stepsLabel}`;
}

export function WorkflowList({
  workflows,
  replay,
  onPlay,
  onPause,
  onResume,
  onStop,
  onDelete,
}: WorkflowListProps) {
  const busy = replay.phase === 'running' || replay.phase === 'paused';

  if (workflows.length === 0 && replay.phase === 'idle') {
    return <p className="text-xs text-slate-500">{WORKFLOW_UI.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <ReplayBanner replay={replay} onPause={onPause} onResume={onResume} onStop={onStop} />
      {workflows.map((workflow) => (
        <div
          key={workflow.id}
          className="flex items-start justify-between gap-2 rounded-md border border-surface-border bg-surface-raised px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-xs text-slate-200">{workflow.name}</p>
            {workflow.description && (
              <p className="truncate text-[11px] text-slate-500">{workflow.description}</p>
            )}
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">
              {stepLabel(workflow.steps.length)}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => onPlay(workflow.id)}
              disabled={busy}
              className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-300 hover:border-accent hover:text-white disabled:opacity-40"
            >
              {WORKFLOW_UI.play}
            </button>
            <button
              type="button"
              onClick={() => onDelete(workflow.id)}
              disabled={busy}
              className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-400 hover:border-red-500/60 hover:text-red-300 disabled:opacity-40"
            >
              {WORKFLOW_UI.delete}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
