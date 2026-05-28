import { type ModeDefinition } from '@/shared/constants/modes';

import { type PendingHandoff } from '../handoff';
import { AgentPanel } from './agent/AgentPanel';
import { ChatPanel } from './chat/ChatPanel';
import { HistoryPanel } from './history/HistoryPanel';
import { ModePlaceholder } from './ModePlaceholder';
import { ResearchPanel } from './research/ResearchPanel';
import { WorkflowPanel } from './workflows/WorkflowPanel';

interface ModePanelProps {
  mode: ModeDefinition;
  pendingHandoff: PendingHandoff | null;
  onActionHandoff: (handoff: PendingHandoff) => void;
  onConsumeHandoff: () => void;
}

export function ModePanel({ mode, pendingHandoff, onActionHandoff, onConsumeHandoff }: ModePanelProps) {
  if (mode.id === 'agent') {
    return <AgentPanel pendingHandoff={pendingHandoff} onConsumeHandoff={onConsumeHandoff} />;
  }
  if (mode.id === 'chat') return <ChatPanel />;
  if (mode.id === 'research') return <ResearchPanel onActionHandoff={onActionHandoff} />;
  if (mode.id === 'workflows') return <WorkflowPanel />;
  if (mode.id === 'history') return <HistoryPanel />;
  return <ModePlaceholder mode={mode} />;
}
