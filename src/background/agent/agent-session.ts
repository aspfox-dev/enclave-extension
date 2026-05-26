import { loadSettings } from '@/shared/storage/settings-store';
import { loadVault } from '@/shared/storage/vault-store';
import { type AgentResult } from '@/shared/types/agent';
import { type AgentCommand, type AgentEvent } from '@/shared/types/messaging';
import { formatVaultForPrompt, matchesFormKeywords } from '@/shared/util/keywords';

import { getActiveTabId } from '../tabs';
import { runAgent } from './agent-runner';

export class AgentSession {
  private controller: AbortController | null = null;
  private paused = false;
  private running = false;
  private connected = true;

  constructor(private readonly port: chrome.runtime.Port) {
    port.onMessage.addListener((command: AgentCommand) => this.dispatch(command));
    port.onDisconnect.addListener(() => {
      this.connected = false;
      this.stop();
    });
  }

  private dispatch(command: AgentCommand): void {
    switch (command.type) {
      case 'start':
        void this.start(command.goal);
        return;
      case 'pause':
        this.pause();
        return;
      case 'resume':
        this.resume();
        return;
      case 'stop':
        this.stop();
    }
  }

  private emit(event: AgentEvent): void {
    if (this.connected) this.port.postMessage(event);
  }

  private async start(goal: string): Promise<void> {
    const trimmed = goal.trim();
    if (this.running) return;
    if (!trimmed) {
      this.emit({ type: 'log', level: 'error', message: 'Enter a goal before running the agent.' });
      return;
    }

    this.running = true;
    this.paused = false;
    this.controller = new AbortController();
    this.emit({ type: 'status', status: 'running' });

    try {
      const settings = await loadSettings();
      const tabId = await getActiveTabId();
      const vault = matchesFormKeywords(trimmed)
        ? formatVaultForPrompt(await loadVault()) || undefined
        : undefined;

      const result = await runAgent({
        goal: trimmed,
        tabId,
        limits: settings.limits,
        features: settings.features,
        signal: this.controller.signal,
        isPaused: () => this.paused,
        emit: (event) => this.emit(event),
        vault,
      });
      this.report(result);
    } catch (error) {
      this.report(this.toResult(error));
    } finally {
      this.running = false;
      this.controller = null;
    }
  }

  private toResult(error: unknown): AgentResult {
    if (this.controller?.signal.aborted) {
      return { status: 'stopped', summary: 'Stopped by you.', steps: [] };
    }
    const summary = error instanceof Error ? error.message : 'The agent hit an unexpected error.';
    return { status: 'failed', summary, steps: [] };
  }

  private report(result: AgentResult): void {
    this.emit({ type: 'done', result });
    this.emit({ type: 'status', status: result.status });
  }

  private pause(): void {
    if (!this.running) return;
    this.paused = true;
    this.emit({ type: 'status', status: 'paused' });
  }

  private resume(): void {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.emit({ type: 'status', status: 'running' });
  }

  private stop(): void {
    this.paused = false;
    this.controller?.abort();
  }
}
