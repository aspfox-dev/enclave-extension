import { type ModeDefinition } from '@/shared/constants/modes';

import { AgentPanel } from './agent/AgentPanel';
import { ChatPanel } from './chat/ChatPanel';
import { ModePlaceholder } from './ModePlaceholder';
import { ResearchPanel } from './research/ResearchPanel';
import { WorkflowPanel } from './workflows/WorkflowPanel';

interface ModePanelProps {
  mode: ModeDefinition;
}

export function ModePanel({ mode }: ModePanelProps) {
  if (mode.id === 'agent') return <AgentPanel />;
  if (mode.id === 'chat') return <ChatPanel />;
  if (mode.id === 'research') return <ResearchPanel />;
  if (mode.id === 'workflows') return <WorkflowPanel />;
  return <ModePlaceholder mode={mode} />;
}
