export type WorkflowStep =
  | { kind: 'navigate'; url: string }
  | { kind: 'click'; selector: string; label: string }
  | { kind: 'type'; selector: string; text: string; submit: boolean };

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  createdAt: number;
  steps: WorkflowStep[];
}

export type ReplayPhase = 'idle' | 'running' | 'paused' | 'done' | 'failed' | 'stopped';

export const DEFAULT_WORKFLOW_VERSION = '1.0';
export const DEFAULT_WORKFLOW_AUTHOR = 'me';
