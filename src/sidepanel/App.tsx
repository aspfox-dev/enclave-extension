import { useCallback, useState } from 'react';

import { DEFAULT_MODE, MODES, type ModeId } from '@/shared/constants/modes';

import { ModePanel } from './components/ModePanel';
import { ModeTabs } from './components/ModeTabs';
import { SidebarHeader } from './components/SidebarHeader';
import { type PendingHandoff } from './handoff';

export function App() {
  const [activeMode, setActiveMode] = useState<ModeId>(DEFAULT_MODE);
  const [handoff, setHandoff] = useState<PendingHandoff | null>(null);
  const mode = MODES.find((candidate) => candidate.id === activeMode) ?? MODES[0];

  const handOff = useCallback((next: PendingHandoff) => {
    setHandoff(next);
    setActiveMode('agent');
  }, []);

  const consumeHandoff = useCallback(() => setHandoff(null), []);

  return (
    <div className="flex h-full flex-col">
      <SidebarHeader />
      <ModeTabs modes={MODES} activeMode={activeMode} onSelect={setActiveMode} />
      <ModePanel
        mode={mode}
        pendingHandoff={handoff}
        onActionHandoff={handOff}
        onConsumeHandoff={consumeHandoff}
      />
    </div>
  );
}
