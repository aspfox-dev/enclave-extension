export type SourceStatus = 'pending' | 'active' | 'done' | 'error' | 'skipped';

export type ResearchPhase =
  | 'idle'
  | 'searching'
  | 'reading'
  | 'synthesizing'
  | 'done'
  | 'failed'
  | 'stopped';

export interface ResearchSource {
  url: string;
  title: string;
  status: SourceStatus;
  summary?: string;
  error?: string;
}

export interface ResearchReport {
  id: string;
  topic: string;
  createdAt: number;
  html: string;
  conclusion: string;
  sources: ResearchSource[];
  aiOverview?: string;
}
