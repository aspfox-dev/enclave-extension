import { WORKFLOW_UI } from '@/shared/constants/strings';
import { type ReplayPhase } from '@/shared/types/workflow';

import { type ReplayState } from '../../hooks/useWorkflowSession';

interface ReplayBannerProps {
  replay: ReplayState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const TEXT_BY_PHASE: Record<ReplayPhase, string> = {
  idle: '',
  running: WORKFLOW_UI.replayRunning,
  paused: WORKFLOW_UI.replayPaused,
  done: WORKFLOW_UI.replayDone,
  failed: WORKFLOW_UI.replayFailed,
  stopped: WORKFLOW_UI.replayStopped,
};

export function ReplayBanner({ replay, onPause, onResume, onStop }: ReplayBannerProps) {
  if (replay.phase === 'idle') return null;

  const isBusy = replay.phase === 'running' || replay.phase === 'paused';

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-accent/40 bg-accent-muted/15 px-3 py-2">
      <span className="text-xs text-slate-200">
        {TEXT_BY_PHASE[replay.phase]}
        {isBusy && replay.total > 0 && (
          <span className="ml-2 text-slate-400">
            {replay.index + 1} / {replay.total}
          </span>
        )}
      </span>
      {isBusy && (
        <div className="flex gap-1">
          {replay.phase === 'running' ? (
            <button
              type="button"
              onClick={onPause}
              className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-300 hover:border-accent hover:text-white"
            >
              {WORKFLOW_UI.pause}
            </button>
          ) : (
            <button
              type="button"
              onClick={onResume}
              className="rounded-md border border-surface-border px-2 py-0.5 text-[11px] text-slate-300 hover:border-accent hover:text-white"
            >
              {WORKFLOW_UI.resume}
            </button>
          )}
          <button
            type="button"
            onClick={onStop}
            className="rounded-md border border-red-500/40 px-2 py-0.5 text-[11px] text-red-300 hover:border-red-400 hover:text-red-200"
          >
            {WORKFLOW_UI.stop}
          </button>
        </div>
      )}
    </div>
  );
}
