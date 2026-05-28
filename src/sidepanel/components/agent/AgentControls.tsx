import { AGENT_UI } from '@/shared/constants/strings';
import { type AgentStatus } from '@/shared/types/agent';

interface AgentControlsProps {
  status: AgentStatus;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const GHOST =
  'rounded-md border border-surface-border px-3 py-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:border-surface-borderStrong hover:text-slate-100';

const STOP =
  'rounded-md border border-surface-border px-3 py-1.5 text-[12px] font-medium text-slate-400 transition-colors hover:border-status-error/50 hover:text-status-error';

export function AgentControls({ status, onPause, onResume, onStop }: AgentControlsProps) {
  if (status !== 'running' && status !== 'paused') return null;

  return (
    <div className="flex items-center gap-2">
      {status === 'running' ? (
        <button type="button" onClick={onPause} className={GHOST}>
          {AGENT_UI.pause}
        </button>
      ) : (
        <button type="button" onClick={onResume} className={GHOST}>
          {AGENT_UI.resume}
        </button>
      )}
      <button type="button" onClick={onStop} className={STOP}>
        {AGENT_UI.stop}
      </button>
    </div>
  );
}
