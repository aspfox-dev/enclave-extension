import { type ResearchActionContext } from '@/shared/types/research';

export interface PendingHandoff {
  goal: string;
  research: ResearchActionContext;
}
