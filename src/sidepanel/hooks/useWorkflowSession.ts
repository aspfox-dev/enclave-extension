import { useCallback, useEffect, useRef, useState } from 'react';

import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { deleteWorkflow, listWorkflows } from '@/shared/storage/workflow-store';
import {
  WORKFLOW_PORT,
  type WorkflowCommand,
  type WorkflowEvent,
} from '@/shared/types/messaging';
import { type ReplayPhase, type Workflow, type WorkflowStep } from '@/shared/types/workflow';

export interface ReplayState {
  phase: ReplayPhase;
  index: number;
  total: number;
}

export interface WorkflowSessionApi {
  isRecording: boolean;
  recordedSteps: WorkflowStep[];
  workflows: Workflow[];
  replay: ReplayState;
  error: string | null;
  startRecording: () => void;
  stopRecording: (name: string, description: string) => void;
  discardRecording: () => void;
  startReplay: (workflowId: string) => void;
  pauseReplay: () => void;
  resumeReplay: () => void;
  stopReplay: () => void;
  removeWorkflow: (id: string) => Promise<void>;
}

const INITIAL_REPLAY: ReplayState = { phase: 'idle', index: 0, total: 0 };

export function useWorkflowSession(): WorkflowSessionApi {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<WorkflowStep[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [replay, setReplay] = useState<ReplayState>(INITIAL_REPLAY);
  const [error, setError] = useState<string | null>(null);

  const portRef = useRef<chrome.runtime.Port | null>(null);

  const refreshWorkflows = useCallback(async () => {
    try {
      setWorkflows(await listWorkflows());
    } catch (loadError) {
      console.warn('Enclave: could not load saved workflows.', loadError);
    }
  }, []);

  const handleEvent = useCallback((event: WorkflowEvent) => {
    switch (event.type) {
      case 'recording':
        setIsRecording(event.isRecording);
        setRecordedSteps(event.steps);
        return;
      case 'recordedStep':
        setRecordedSteps((prev) => [...prev, event.step]);
        return;
      case 'workflowSaved':
        setWorkflows((prev) => [event.workflow, ...prev.filter((w) => w.id !== event.workflow.id)]);
        return;
      case 'replay':
        setReplay({ phase: event.phase, index: event.index ?? 0, total: event.total ?? 0 });
        return;
      case 'log':
        if (event.level === 'error') setError(event.message);
    }
  }, []);

  const connect = useCallback(() => {
    const port = chrome.runtime.connect({ name: WORKFLOW_PORT });
    port.onMessage.addListener(handleEvent);
    port.onDisconnect.addListener(() => {
      portRef.current = null;
    });
    portRef.current = port;
    return port;
  }, [handleEvent]);

  useEffect(() => {
    void refreshWorkflows();
    const port = connect();
    const onStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: chrome.storage.AreaName,
    ) => {
      if (area !== 'local' || !(STORAGE_KEYS.workflows in changes)) return;
      const next = changes[STORAGE_KEYS.workflows].newValue as Workflow[] | undefined;
      setWorkflows(next ?? []);
    };
    chrome.storage.onChanged.addListener(onStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(onStorageChange);
      port.disconnect();
      portRef.current = null;
    };
  }, [connect, refreshWorkflows]);

  const send = useCallback(
    (command: WorkflowCommand) => {
      (portRef.current ?? connect()).postMessage(command);
    },
    [connect],
  );

  const startRecording = useCallback(() => {
    setError(null);
    setRecordedSteps([]);
    send({ type: 'startRecording' });
  }, [send]);

  const stopRecording = useCallback(
    (name: string, description: string) => send({ type: 'stopRecording', name, description }),
    [send],
  );

  const discardRecording = useCallback(() => send({ type: 'discardRecording' }), [send]);

  const startReplay = useCallback(
    (workflowId: string) => {
      setError(null);
      send({ type: 'startReplay', workflowId });
    },
    [send],
  );

  const pauseReplay = useCallback(() => send({ type: 'pauseReplay' }), [send]);
  const resumeReplay = useCallback(() => send({ type: 'resumeReplay' }), [send]);
  const stopReplay = useCallback(() => send({ type: 'stopReplay' }), [send]);

  const removeWorkflow = useCallback(
    async (id: string) => {
      await deleteWorkflow(id);
      await refreshWorkflows();
    },
    [refreshWorkflows],
  );

  return {
    isRecording,
    recordedSteps,
    workflows,
    replay,
    error,
    startRecording,
    stopRecording,
    discardRecording,
    startReplay,
    pauseReplay,
    resumeReplay,
    stopReplay,
    removeWorkflow,
  };
}
