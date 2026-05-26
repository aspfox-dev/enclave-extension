import { type AgentAction } from '@/shared/types/agent';

const MAX_REPEATS = 3;

function actionKey(action: AgentAction): string {
  switch (action.kind) {
    case 'click':
      return `click:${action.ref}`;
    case 'type':
      return `type:${action.ref}:${action.text}`;
    case 'scroll':
      return `scroll:${action.direction}`;
    case 'navigate':
      return `navigate:${action.url}`;
    case 'rawClick':
      return `rawClick:${Math.round(action.x)}:${Math.round(action.y)}`;
    case 'rawType':
      return `rawType:${action.text}`;
    default:
      return action.kind;
  }
}

export interface LoopVerdict {
  looping: boolean;
  reason: string;
}

/**
 * Flags two failure shapes the DOM-only loop can fall into: choosing the same
 * action over and over, and acting without the page ever changing state.
 */
export class LoopGuard {
  private lastKey = '';
  private repeats = 0;
  private lastHash = '';
  private stuckHashes = 0;

  observe(action: AgentAction, stateHash: string): LoopVerdict {
    this.repeats = actionKey(action) === this.lastKey ? this.repeats + 1 : 1;
    this.lastKey = actionKey(action);

    this.stuckHashes = stateHash === this.lastHash ? this.stuckHashes + 1 : 0;
    this.lastHash = stateHash;

    if (this.repeats >= MAX_REPEATS) return { looping: true, reason: 'repeated the same action three times' };
    if (this.stuckHashes >= MAX_REPEATS) return { looping: true, reason: 'the page stopped responding to actions' };
    return { looping: false, reason: '' };
  }

  reset(): void {
    this.lastKey = '';
    this.repeats = 0;
    this.lastHash = '';
    this.stuckHashes = 0;
  }
}
