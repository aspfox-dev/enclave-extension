import { useEffect } from 'react';

import { RESEARCH_UI } from '@/shared/constants/strings';
import { type ResearchPhase } from '@/shared/types/research';

import { useResearchSession } from '../../hooks/useResearchSession';
import { ReportHistory } from './ReportHistory';
import { ResearchInput } from './ResearchInput';
import { SourceList } from './SourceList';

const PHASE_LABEL: Partial<Record<ResearchPhase, string>> = {
  searching: RESEARCH_UI.phaseSearching,
  reading: RESEARCH_UI.phaseReading,
  synthesizing: RESEARCH_UI.phaseSynthesizing,
  done: RESEARCH_UI.phaseDone,
};

export function ResearchPanel() {
  const { phase, sources, aiOverview, history, error, start, stop, reopenReport, removeReport } =
    useResearchSession();
  const isBusy = phase === 'searching' || phase === 'reading' || phase === 'synthesizing';
  const phaseLabel = PHASE_LABEL[phase];

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
      <ResearchInput disabled={isBusy} isBusy={isBusy} onRun={start} onStop={stop} />
      {phaseLabel && <p className="text-xs text-accent">{phaseLabel}</p>}
      <div className="flex-1 overflow-y-auto">
        <SourceList sources={sources} aiOverview={aiOverview} error={error} />
      </div>
      <ReportHistory
        history={history}
        onOpen={reopenReport}
        onRemove={(id) => void removeReport(id)}
      />
    </section>
  );
}
