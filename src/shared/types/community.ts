import { type WorkflowStep } from './workflow';

export interface CommunityWorkflow {
  name: string;
  description: string;
  version: string;
  author: string;
  steps: WorkflowStep[];
}

export interface CommunityCache {
  workflows: CommunityWorkflow[];
  fetchedAt: number;
}
