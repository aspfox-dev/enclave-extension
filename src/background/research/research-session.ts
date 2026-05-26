import { type ResearchCommand, type ResearchEvent } from '@/shared/types/messaging';

import { runResearch } from './research-runner';

export class ResearchSession {
  private controller: AbortController | null = null;
  private running = false;
  private connected = true;

  constructor(private readonly port: chrome.runtime.Port) {
    port.onMessage.addListener((command: ResearchCommand) => this.dispatch(command));
    port.onDisconnect.addListener(() => {
      this.connected = false;
      this.stop();
    });
  }

  private dispatch(command: ResearchCommand): void {
    if (command.type === 'start') void this.start(command.topic);
    else if (command.type === 'stop') this.stop();
  }

  private emit(event: ResearchEvent): void {
    if (this.connected) this.port.postMessage(event);
  }

  private async start(topic: string): Promise<void> {
    const trimmed = topic.trim();
    if (this.running) return;
    if (!trimmed) {
      this.emit({ type: 'log', level: 'error', message: 'Enter a topic before running research.' });
      return;
    }

    this.running = true;
    this.controller = new AbortController();

    try {
      const report = await runResearch({
        topic: trimmed,
        signal: this.controller.signal,
        emit: (event) => this.emit(event),
      });
      this.emit({ type: 'done', report });
    } catch (error) {
      this.reportFailure(error);
    } finally {
      this.running = false;
      this.controller = null;
    }
  }

  private reportFailure(error: unknown): void {
    if (this.controller?.signal.aborted) {
      this.emit({ type: 'phase', phase: 'stopped' });
      return;
    }
    const message = error instanceof Error ? error.message : 'The research run hit an unexpected error.';
    this.emit({ type: 'log', level: 'error', message });
    this.emit({ type: 'phase', phase: 'failed' });
  }

  private stop(): void {
    this.controller?.abort();
  }
}
