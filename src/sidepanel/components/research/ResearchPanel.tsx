import { useEffect } from 'react';

import { RESEARCH_UI } from '@/shared/constants/strings';
import { type ResearchPhase } from '@/shared/types/research';
import { buildActionContext } from '@/shared/util/research-action';

import { type PendingHandoff } from '../../handoff';
import { useResearchSession } from '../../hooks/useResearchSession';
import { ActionFollowup } from './ActionFollowup';
import { ReportHistory } from './ReportHistory';
import { ResearchInput } from './ResearchInput';
import { SourceList } from './SourceList';

const PHASE_LABEL: Partial<Record<ResearchPhase, string>> = {
  searching: RESEARCH_UI.phaseSearching,
  reading: RESEARCH_UI.phaseReading,
  synthesizing: RESEARCH_UI.phaseSynthesizing,
  done: RESEARCH_UI.phaseDone,
};

interface ResearchPanelProps {
  onActionHandoff: (handoff: PendingHandoff) => void;
}

export function ResearchPanel({ onActionHandoff }: ResearchPanelProps) {
  const {
    phase,
    sources,
    aiOverview,
    history,
    error,
    latestReport,
    start,
    stop,
    reopenReport,
    removeReport,
  } = useResearchSession();
  const isBusy = phase === 'searching' || phase === 'reading' || phase === 'synthesizing';
  const phaseLabel = PHASE_LABEL[phase];
  const canAct = phase === 'done' && latestReport !== null;

  useEffect(() => {
    if (!isBusy) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stop();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isBusy, stop]);

  function handleActionSubmit(goal: string) {
    if (!latestReport) return;
    onActionHandoff({ goal, research: buildActionContext(latestReport) });
  }

  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      {/* Command zone */}
      <div className="shrink-0 px-4 pb-3 pt-4">
        <ResearchInput disabled={isBusy} isBusy={isBusy} onRun={start} onStop={stop} />
        {phaseLabel && (
          <p className="mt-2 text-[11px] font-medium text-accent">{phaseLabel}</p>
        )}
      </div>

      {/* Sources zone */}
      <div className="flex flex-1 flex-col overflow-hidden border-t border-surface-border">
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <SourceList sources={sources} aiOverview={aiOverview} error={error} />
          {canAct && latestReport && (
            <div className="mt-3">
              <ActionFollowup topic={latestReport.topic} onSubmit={handleActionSubmit} />
            </div>
          )}
        </div>

        {/* Report history — pinned to bottom of sources zone */}
        <div className="shrink-0 px-4 pb-4">
          <ReportHistory
            history={history}
            onOpen={reopenReport}
            onRemove={(id) => void removeReport(id)}
          />
        </div>
      </div>
    </section>
  );
}
