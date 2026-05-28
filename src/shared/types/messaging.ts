import { type ChatSubmode } from '@/shared/constants/settings';

import { type AgentResult, type AgentStatus, type AgentStep, type ScrollDirection } from './agent';
import { type ChatTurn, type PageContext } from './chat';
import { type PageSnapshot } from './dom';
import {
  type ResearchActionContext,
  type ResearchPhase,
  type ResearchReport,
  type ResearchSource,
} from './research';
import { type TaskVerification } from './verification';
import { type ReplayPhase, type Workflow, type WorkflowStep } from './workflow';

export const AGENT_PORT = 'enclave-agent';
export const RESEARCH_PORT = 'enclave-research';
export const WORKFLOW_PORT = 'enclave-workflow';

export type ContentRequest =
  | { type: 'extract' }
  | { type: 'pageText' }
  | { type: 'serpUrls' }
  | { type: 'click'; ref: number }
  | { type: 'type'; ref: number; text: string; submit: boolean }
  | { type: 'scroll'; direction: ScrollDirection }
  | { type: 'clickSelector'; selector: string }
  | { type: 'typeSelector'; selector: string; text: string; submit: boolean }
  | { type: 'enableRecording' }
  | { type: 'disableRecording' };

export interface ContentActionResult {
  ok: boolean;
  detail: string;
}

export type ContentReply<T> = { ok: true; data: T } | { ok: false; error: string };

export type ExtractReply = ContentReply<PageSnapshot>;
export type PageTextReply = ContentReply<PageContext>;
export type SerpUrlsReply = ContentReply<string[]>;
export type ActionReply = ContentReply<ContentActionResult>;

export type RuntimeRequest =
  | { type: 'chat:ask'; history: ChatTurn[]; submode: ChatSubmode }
  | { type: 'workflow:event'; step: WorkflowStep };

export type RuntimeResponse =
  | { ok: true; reply: string }
  | { ok: false; error: string };

export type AgentCommand =
  | { type: 'start'; goal: string; research?: ResearchActionContext }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' };

export type AgentEvent =
  | { type: 'status'; status: AgentStatus }
  | { type: 'step'; step: AgentStep }
  | { type: 'log'; level: 'info' | 'error'; message: string }
  | { type: 'done'; result: AgentResult }
  | { type: 'verification'; verification: TaskVerification };

export type ResearchCommand =
  | { type: 'start'; topic: string }
  | { type: 'stop' };

export type ResearchEvent =
  | { type: 'phase'; phase: ResearchPhase }
  | { type: 'sources'; sources: ResearchSource[] }
  | { type: 'source'; index: number; source: ResearchSource }
  | { type: 'overview'; text: string }
  | { type: 'log'; level: 'info' | 'error'; message: string }
  | { type: 'done'; report: ResearchReport };

export type WorkflowCommand =
  | { type: 'startRecording' }
  | { type: 'stopRecording'; name: string; description: string }
  | { type: 'discardRecording' }
  | { type: 'startReplay'; workflowId: string }
  | { type: 'pauseReplay' }
  | { type: 'resumeReplay' }
  | { type: 'stopReplay' };

export type WorkflowEvent =
  | { type: 'recording'; isRecording: boolean; steps: WorkflowStep[] }
  | { type: 'recordedStep'; step: WorkflowStep }
  | { type: 'workflowSaved'; workflow: Workflow }
  | { type: 'replay'; phase: ReplayPhase; index?: number; total?: number }
  | { type: 'log'; level: 'info' | 'error'; message: string };
