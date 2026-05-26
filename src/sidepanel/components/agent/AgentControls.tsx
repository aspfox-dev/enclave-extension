import { AGENT_UI } from '@/shared/constants/strings';
import { type AgentStatus } from '@/shared/types/agent';

interface AgentControlsProps {
  status: AgentStatus;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const CONTROL_CLASS =
  'rounded-md border border-surface-border px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-accent hover:text-white';

export function AgentControls({ status, onPause, onResume, onStop }: AgentControlsProps) {
  if (status !== 'running' && status !== 'paused') return null;

  return (
    <div className="flex gap-2">
      {status === 'running' ? (
        <button type="button" onClick={onPause} className={CONTROL_CLASS}>
          {AGENT_UI.pause}
        </button>
      ) : (
        <button type="button" onClick={onResume} className={CONTROL_CLASS}>
          {AGENT_UI.resume}
        </button>
      )}
      <button
        type="button"
        onClick={onStop}
        className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:border-red-400 hover:text-red-200"
      >
        {AGENT_UI.stop}
      </button>
    </div>
  );
}
