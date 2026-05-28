import { AGENT_STATUS_LABELS, AGENT_UI } from '@/shared/constants/strings';
import { type AgentAction, type AgentResult, type AgentStatus, type AgentStep } from '@/shared/types/agent';
import { type TaskVerification } from '@/shared/types/verification';

import { type LogEntry } from '../../hooks/useAgentSession';
import { VerificationBadge } from './VerificationBadge';

interface ActionLogProps {
  steps: AgentStep[];
  logs: LogEntry[];
  status: AgentStatus;
  result: AgentResult | null;
  verification: TaskVerification | null;
}

const RESULT_BORDER: Record<AgentResult['status'], string> = {
  done: 'border-l-2 border-status-success/60',
  failed: 'border-l-2 border-status-error/60',
  stopped: 'border-l-2 border-status-warning/60',
};

const RESULT_LABEL_COLOR: Record<AgentResult['status'], string> = {
  done: 'text-status-success',
  failed: 'text-status-error',
  stopped: 'text-status-warning',
};

function actionTarget(action: AgentAction): string {
  switch (action.kind) {
    case 'click':
    case 'type':
      return `#${action.ref}`;
    case 'scroll':
      return action.direction;
    case 'navigate': {
      try {
        return new URL(action.url).hostname;
      } catch {
        return action.url;
      }
    }
    case 'rawClick':
      return `(${action.x}, ${action.y})`;
    default:
      return '';
  }
}

function reasonOf(action: AgentAction): string {
  return 'reason' in action ? action.reason : action.summary;
}

export function ActionLog({ steps, logs, status, result, verification }: ActionLogProps) {
  const errors = logs.filter((entry) => entry.level === 'error');
  const isEmpty = steps.length === 0 && errors.length === 0 && !result;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
      {isEmpty ? (
        <p className="text-[12px] text-slate-500">{AGENT_UI.emptyLog}</p>
      ) : (
        <div className="flex flex-col gap-1">
          {result && (
            <div className={`pl-3 py-2 ${RESULT_BORDER[result.status]}`}>
              <span className={`text-[12px] font-semibold ${RESULT_LABEL_COLOR[result.status]}`}>
                {AGENT_STATUS_LABELS[result.status]}
              </span>
              {result.summary && (
                <p className="mt-0.5 text-[12px] text-slate-400">{result.summary}</p>
              )}
            </div>
          )}

          {verification && <VerificationBadge verification={verification} />}

          {steps.map((step) => {
            const target = actionTarget(step.action);
            return (
              <div
                key={step.index}
                className={`border-l-2 pl-3 py-2 ${
                  step.succeeded ? 'border-status-success/40' : 'border-status-error/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0 tabular-nums text-[10px] font-medium text-slate-600">
                    {String(step.index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[11px] text-slate-300">{step.action.kind}</span>
                  {target && (
                    <span className="min-w-0 flex-1 truncate text-[11px] text-slate-500">
                      {target}
                    </span>
                  )}
                  <span
                    className={`ml-auto shrink-0 text-[11px] font-semibold ${
                      step.succeeded ? 'text-status-success' : 'text-status-error'
                    }`}
                  >
                    {step.succeeded ? '✓' : '✕'}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-slate-400">
                  {reasonOf(step.action)}
                </p>
                {step.detail && (
                  <p className="mt-0.5 text-[11px] text-slate-600">{step.detail}</p>
                )}
              </div>
            );
          })}

          {errors.map((entry) => (
            <div key={entry.id} className="border-l-2 border-status-error/60 pl-3 py-2">
              <p className="text-[12px] text-status-error">{entry.message}</p>
            </div>
          ))}

          {status === 'running' && (
            <p className="pl-3 py-1.5 text-[12px] text-slate-500">Thinking…</p>
          )}
        </div>
      )}
    </div>
  );
}
