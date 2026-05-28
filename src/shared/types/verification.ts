import { type AgentResult, type AgentStep } from './agent';

export type VerificationVerdict = 'succeeded' | 'uncertain' | 'failed';

export type VerificationConfidence = 'high' | 'medium' | 'low';

export type VerificationMethod = 'vision' | 'dom';

export interface TaskVerification {
  verdict: VerificationVerdict;
  confidence: VerificationConfidence;
  explanation: string;
  method: VerificationMethod;
}

export interface TaskSnapshot {
  url: string;
  title: string;
  textPreview: string;
}

export interface TaskHistoryEntry {
  id: string;
  goal: string;
  status: AgentResult['status'];
  summary: string;
  startedAt: number;
  completedAt: number;
  before: TaskSnapshot;
  after: TaskSnapshot;
  steps: AgentStep[];
  verification: TaskVerification | null;
  screenshotDataUrl?: string;
}
