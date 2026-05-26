import { AGENT_STATUS_LABELS, AGENT_UI } from '@/shared/constants/strings';
import { type AgentAction, type AgentResult, type AgentStatus, type AgentStep } from '@/shared/types/agent';

import { type LogEntry } from '../../hooks/useAgentSession';

interface ActionLogProps {
  steps: AgentStep[];
  logs: LogEntry[];
  status: AgentStatus;
  result: AgentResult | null;
}

const RESULT_TONE: Record<AgentResult['status'], string> = {
  done: 'border-emerald-500/40 text-emerald-300',
  failed: 'border-red-500/40 text-red-300',
  stopped: 'border-amber-500/40 text-amber-300',
};

function actionTitle(action: AgentAction): string {
  switch (action.kind) {
    case 'click':
      return `Click element #${action.ref}`;
    case 'type':
      return `Type into #${action.ref}`;
    case 'scroll':
      return `Scroll ${action.direction}`;
    case 'navigate':
      return `Navigate to ${action.url}`;
    case 'wait':
      return 'Wait';
    case 'rawClick':
      return `Click pixel (${action.x}, ${action.y})`;
    case 'rawType':
      return 'Type at focused element';
    case 'done':
      return 'Done';
    case 'fail':
      return 'Fail';
  }
}

function reasonOf(action: AgentAction): string {
  return 'reason' in action ? action.reason : action.summary;
}

export function ActionLog({ steps, logs, status, result }: ActionLogProps) {
  const errors = logs.filter((entry) => entry.level === 'error');
  const isEmpty = steps.length === 0 && errors.length === 0 && !result;

  if (isEmpty) {
    return <p className="mt-2 text-sm text-slate-500">{AGENT_UI.emptyLog}</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
      {result && (
        <div className={`rounded-md border px-3 py-2 text-sm ${RESULT_TONE[result.status]}`}>
          <span className="font-medium">{AGENT_STATUS_LABELS[result.status]}</span> — {result.summary}
        </div>
      )}

      {steps.map((step) => (
        <div key={step.index} className="rounded-md border border-surface-border bg-surface-raised px-3 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200">
              {step.index + 1}. {actionTitle(step.action)}
            </span>
            <span className={step.succeeded ? 'text-emerald-400' : 'text-red-400'}>
              {step.succeeded ? '✓' : '✕'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{reasonOf(step.action)}</p>
          <p className="mt-0.5 text-xs text-slate-500">{step.detail}</p>
        </div>
      ))}

      {errors.map((entry) => (
        <div key={entry.id} className="rounded-md border border-red-500/40 px-3 py-2 text-xs text-red-300">
          {entry.message}
        </div>
      ))}

      {status === 'running' && (
        <p className="px-1 text-xs text-slate-500">Thinking…</p>
      )}
    </div>
  );
}
