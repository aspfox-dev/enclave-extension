import { useEffect } from 'react';

import { useAgentSession } from '../../hooks/useAgentSession';
import { ActionLog } from './ActionLog';
import { AgentControls } from './AgentControls';
import { GoalInput } from './GoalInput';

export function AgentPanel() {
  const { status, steps, logs, result, start, pause, resume, stop } = useAgentSession();
  const isBusy = status === 'running' || status === 'paused';

  useEffect(() => {
    if (!isBusy) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stop();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isBusy, stop]);

  return (
    <section className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-4">
      <GoalInput disabled={isBusy} onRun={start} />
      <AgentControls status={status} onPause={pause} onResume={resume} onStop={stop} />
      <ActionLog steps={steps} logs={logs} status={status} result={result} />
    </section>
  );
}
