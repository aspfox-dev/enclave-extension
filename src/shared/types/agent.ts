export type AgentStatus = 'idle' | 'running' | 'paused' | 'done' | 'failed' | 'stopped';

export type ScrollDirection = 'up' | 'down';

export type AgentTier = 1 | 2 | 3 | 4;

export type AgentAction =
  | { kind: 'click'; ref: number; reason: string }
  | { kind: 'type'; ref: number; text: string; submit: boolean; reason: string }
  | { kind: 'scroll'; direction: ScrollDirection; reason: string }
  | { kind: 'navigate'; url: string; reason: string }
  | { kind: 'wait'; reason: string }
  | { kind: 'rawClick'; x: number; y: number; reason: string }
  | { kind: 'rawType'; text: string; submit: boolean; reason: string }
  | { kind: 'done'; summary: string }
  | { kind: 'fail'; summary: string };

export interface AgentStep {
  index: number;
  action: AgentAction;
  succeeded: boolean;
  detail: string;
}

export interface AgentResult {
  status: Extract<AgentStatus, 'done' | 'failed' | 'stopped'>;
  summary: string;
  steps: AgentStep[];
}
