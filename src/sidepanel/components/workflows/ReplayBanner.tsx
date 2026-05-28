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

const GHOST =
  'rounded-md border border-surface-border px-2 py-0.5 text-[11px] font-medium text-slate-400 transition-colors hover:border-surface-borderStrong hover:text-slate-100';

const STOP =
  'rounded-md border border-surface-border px-2 py-0.5 text-[11px] font-medium text-slate-400 transition-colors hover:border-status-error/50 hover:text-status-error';

export function ReplayBanner({ replay, onPause, onResume, onStop }: ReplayBannerProps) {
  if (replay.phase === 'idle') return null;

  const isBusy = replay.phase === 'running' || replay.phase === 'paused';

  return (
    <div className="flex items-center justify-between gap-2 border-l-2 border-accent/50 pl-3 py-2">
      <span className="text-[12px] text-slate-200">
        {TEXT_BY_PHASE[replay.phase]}
        {isBusy && replay.total > 0 && (
          <span className="ml-2 text-slate-500">
            {replay.index + 1} / {replay.total}
          </span>
        )}
      </span>
      {isBusy && (
        <div className="flex shrink-0 gap-1">
          {replay.phase === 'running' ? (
            <button type="button" onClick={onPause} className={GHOST}>
              {WORKFLOW_UI.pause}
            </button>
          ) : (
            <button type="button" onClick={onResume} className={GHOST}>
              {WORKFLOW_UI.resume}
            </button>
          )}
          <button type="button" onClick={onStop} className={STOP}>
            {WORKFLOW_UI.stop}
          </button>
        </div>
      )}
    </div>
  );
}
