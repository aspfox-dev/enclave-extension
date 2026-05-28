import { useCallback, useEffect, useRef, useState } from 'react';

import { type AgentResult, type AgentStatus, type AgentStep } from '@/shared/types/agent';
import { AGENT_PORT, type AgentCommand, type AgentEvent } from '@/shared/types/messaging';
import { type ResearchActionContext } from '@/shared/types/research';
import { type TaskVerification } from '@/shared/types/verification';

export interface LogEntry {
  id: number;
  level: 'info' | 'error';
  message: string;
}

export interface AgentSessionApi {
  status: AgentStatus;
  steps: AgentStep[];
  logs: LogEntry[];
  result: AgentResult | null;
  verification: TaskVerification | null;
  start: (goal: string, research?: ResearchActionContext) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useAgentSession(): AgentSessionApi {
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [verification, setVerification] = useState<TaskVerification | null>(null);

  const portRef = useRef<chrome.runtime.Port | null>(null);
  const logId = useRef(0);

  const handleEvent = useCallback((event: AgentEvent) => {
    switch (event.type) {
      case 'status':
        setStatus(event.status);
        return;
      case 'step':
        setSteps((prev) => [...prev, event.step]);
        return;
      case 'log':
        logId.current += 1;
        setLogs((prev) => [...prev, { id: logId.current, level: event.level, message: event.message }]);
        return;
      case 'done':
        setResult(event.result);
        return;
      case 'verification':
        setVerification(event.verification);
    }
  }, []);

  const connect = useCallback(() => {
    const port = chrome.runtime.connect({ name: AGENT_PORT });
    port.onMessage.addListener(handleEvent);
    port.onDisconnect.addListener(() => {
      portRef.current = null;
    });
    portRef.current = port;
    return port;
  }, [handleEvent]);

  useEffect(() => {
    const port = connect();
    return () => {
      port.disconnect();
      portRef.current = null;
    };
  }, [connect]);

  const send = useCallback(
    (command: AgentCommand) => {
      (portRef.current ?? connect()).postMessage(command);
    },
    [connect],
  );

  const start = useCallback(
    (goal: string, research?: ResearchActionContext) => {
      setSteps([]);
      setLogs([]);
      setResult(null);
      setVerification(null);
      send({ type: 'start', goal, research });
    },
    [send],
  );

  const pause = useCallback(() => send({ type: 'pause' }), [send]);
  const resume = useCallback(() => send({ type: 'resume' }), [send]);
  const stop = useCallback(() => send({ type: 'stop' }), [send]);

  return { status, steps, logs, result, verification, start, pause, resume, stop };
}
