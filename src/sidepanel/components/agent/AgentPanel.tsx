import { useEffect, useState } from 'react';

import { RESEARCH_UI } from '@/shared/constants/strings';

import { type PendingHandoff } from '../../handoff';
import { useAgentSession } from '../../hooks/useAgentSession';
import { ActionLog } from './ActionLog';
import { AgentControls } from './AgentControls';
import { GoalInput } from './GoalInput';

interface AgentPanelProps {
  pendingHandoff: PendingHandoff | null;
  onConsumeHandoff: () => void;
}

export function AgentPanel({ pendingHandoff, onConsumeHandoff }: AgentPanelProps) {
  const { status, steps, logs, result, verification, start, pause, resume, stop } =
    useAgentSession();
  const [activeResearchTopic, setActiveResearchTopic] = useState<string | null>(null);
  const isBusy = status === 'running' || status === 'paused';

  useEffect(() => {
    if (!pendingHandoff) return;
    setActiveResearchTopic(pendingHandoff.research.topic);
    start(pendingHandoff.goal, pendingHandoff.research);
    onConsumeHandoff();
  }, [pendingHandoff, start, onConsumeHandoff]);

  useEffect(() => {
    if (!isBusy) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stop();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isBusy, stop]);

  function handleManualRun(goal: string) {
    setActiveResearchTopic(null);
    start(goal);
  }

  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      {/* Command zone */}
      <div className="shrink-0 px-4 pb-3 pt-4">
        <GoalInput disabled={isBusy} onRun={handleManualRun} />
        {activeResearchTopic && (
          <div className="mt-2 flex items-center justify-between gap-2 border-l-2 border-accent/50 pl-3 py-1.5">
            <span className="text-[11px] text-slate-400">
              {RESEARCH_UI.handoffBanner}:{' '}
              <span className="text-slate-200">"{activeResearchTopic}"</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveResearchTopic(null)}
              className="shrink-0 text-[11px] text-slate-500 transition-colors hover:text-slate-200"
            >
              {RESEARCH_UI.handoffClear}
            </button>
          </div>
        )}
      </div>

      {/* Execution zone */}
      <div className="flex flex-1 flex-col overflow-hidden border-t border-surface-border">
        {isBusy && (
          <div className="shrink-0 border-b border-surface-border px-4 py-2">
            <AgentControls status={status} onPause={pause} onResume={resume} onStop={stop} />
          </div>
        )}
        <ActionLog
          steps={steps}
          logs={logs}
          status={status}
          result={result}
          verification={verification}
        />
      </div>
    </section>
  );
}
