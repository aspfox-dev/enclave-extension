import { loadSettings } from '@/shared/storage/settings-store';
import { getWorkflow, saveWorkflow } from '@/shared/storage/workflow-store';
import {
  type WorkflowCommand,
  type WorkflowEvent,
} from '@/shared/types/messaging';
import {
  DEFAULT_WORKFLOW_AUTHOR,
  DEFAULT_WORKFLOW_VERSION,
  type Workflow,
  type WorkflowStep,
} from '@/shared/types/workflow';

import { WorkflowRecorder } from './recorder';
import { runReplay } from './replayer';

let activeSession: WorkflowSession | null = null;

export function getActiveWorkflowSession(): WorkflowSession | null {
  return activeSession;
}

export class WorkflowSession {
  private readonly recorder = new WorkflowRecorder();
  private replayController: AbortController | null = null;
  private replayPaused = false;
  private connected = true;

  constructor(private readonly port: chrome.runtime.Port) {
    activeSession = this;
    port.onMessage.addListener((command: WorkflowCommand) => this.dispatch(command));
    port.onDisconnect.addListener(() => this.onDisconnect());
  }

  handleRecordedStep(step: WorkflowStep, fromTabId: number | undefined): void {
    if (!this.recorder.isActive()) return;
    this.recorder.handleStep(step, fromTabId);
    this.emit({ type: 'recordedStep', step });
  }

  private dispatch(command: WorkflowCommand): void {
    switch (command.type) {
      case 'startRecording':
        void this.startRecording();
        return;
      case 'stopRecording':
        void this.stopRecording(command.name, command.description);
        return;
      case 'discardRecording':
        void this.discardRecording();
        return;
      case 'startReplay':
        void this.startReplay(command.workflowId);
        return;
      case 'pauseReplay':
        this.pauseReplay();
        return;
      case 'resumeReplay':
        this.resumeReplay();
        return;
      case 'stopReplay':
        this.stopReplay();
    }
  }

  private emit(event: WorkflowEvent): void {
    if (this.connected) this.port.postMessage(event);
  }

  private async startRecording(): Promise<void> {
    try {
      await this.recorder.start();
      this.emit({ type: 'recording', isRecording: true, steps: this.recorder.snapshotSteps() });
    } catch (error) {
      this.emitError(error, 'Could not start recording.');
    }
  }

  private async stopRecording(name: string, description: string): Promise<void> {
    if (!this.recorder.isActive()) return;
    const steps = await this.recorder.stop();
    const workflow: Workflow = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Untitled workflow',
      description: description.trim(),
      version: DEFAULT_WORKFLOW_VERSION,
      author: DEFAULT_WORKFLOW_AUTHOR,
      createdAt: Date.now(),
      steps,
    };
    await saveWorkflow(workflow);
    this.emit({ type: 'recording', isRecording: false, steps: [] });
    this.emit({ type: 'workflowSaved', workflow });
  }

  private async discardRecording(): Promise<void> {
    if (!this.recorder.isActive()) return;
    await this.recorder.stop();
    this.emit({ type: 'recording', isRecording: false, steps: [] });
  }

  private async startReplay(workflowId: string): Promise<void> {
    if (this.replayController) return;

    const workflow = await getWorkflow(workflowId);
    if (!workflow) {
      this.emit({ type: 'log', level: 'error', message: 'That workflow no longer exists.' });
      return;
    }

    const settings = await loadSettings();
    this.replayController = new AbortController();
    this.replayPaused = false;

    try {
      await runReplay(workflow, {
        stepDelayMs: settings.limits.stepDelayMs,
        signal: this.replayController.signal,
        isPaused: () => this.replayPaused,
        emit: (event) => this.emit(event),
      });
    } catch (error) {
      this.reportReplayFailure(error);
    } finally {
      this.replayController = null;
      this.replayPaused = false;
    }
  }

  private reportReplayFailure(error: unknown): void {
    if (this.replayController?.signal.aborted) {
      this.emit({ type: 'replay', phase: 'stopped' });
      return;
    }
    const message = error instanceof Error ? error.message : 'Replay failed.';
    this.emit({ type: 'log', level: 'error', message });
    this.emit({ type: 'replay', phase: 'failed' });
  }

  private pauseReplay(): void {
    if (!this.replayController) return;
    this.replayPaused = true;
    this.emit({ type: 'replay', phase: 'paused' });
  }

  private resumeReplay(): void {
    if (!this.replayController || !this.replayPaused) return;
    this.replayPaused = false;
    this.emit({ type: 'replay', phase: 'running' });
  }

  private stopReplay(): void {
    this.replayPaused = false;
    this.replayController?.abort();
  }

  private emitError(error: unknown, fallback: string): void {
    const message = error instanceof Error ? error.message : fallback;
    this.emit({ type: 'log', level: 'error', message });
  }

  private onDisconnect(): void {
    this.connected = false;
    this.stopReplay();
    void this.recorder.stop();
    if (activeSession === this) activeSession = null;
  }
}
