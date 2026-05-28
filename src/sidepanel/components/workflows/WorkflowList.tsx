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
    return <p className="text-[12px] text-slate-500">{WORKFLOW_UI.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <ReplayBanner replay={replay} onPause={onPause} onResume={onResume} onStop={onStop} />
      {workflows.length > 0 && (
        <ul className="flex flex-col gap-0">
          {workflows.map((workflow) => (
            <li
              key={workflow.id}
              className="flex items-center justify-between gap-2 border-b border-surface-border py-2 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] text-slate-200">{workflow.name}</p>
                {workflow.description && (
                  <p className="truncate text-[11px] text-slate-500">{workflow.description}</p>
                )}
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                  {stepLabel(workflow.steps.length)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => onPlay(workflow.id)}
                  disabled={busy}
                  className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:border-surface-borderStrong hover:text-slate-100 disabled:opacity-40"
                >
                  {WORKFLOW_UI.play}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(workflow.id)}
                  disabled={busy}
                  className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:border-status-error/50 hover:text-status-error disabled:opacity-40"
                >
                  {WORKFLOW_UI.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
