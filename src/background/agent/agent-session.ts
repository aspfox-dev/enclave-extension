import { saveTaskHistoryEntry } from '@/shared/storage/history-store';
import { appendMemories, listMemories } from '@/shared/storage/memory-store';
import { loadSettings } from '@/shared/storage/settings-store';
import { loadVault } from '@/shared/storage/vault-store';
import { type AgentResult } from '@/shared/types/agent';
import { type AgentCommand, type AgentEvent } from '@/shared/types/messaging';
import { type ResearchActionContext } from '@/shared/types/research';
import { type Settings } from '@/shared/types/settings';
import {
  type TaskHistoryEntry,
  type TaskSnapshot,
  type TaskVerification,
} from '@/shared/types/verification';
import { formatVaultForPrompt, matchesFormKeywords } from '@/shared/util/keywords';
import { formatActionContext } from '@/shared/util/research-action';

import { captureCompressedTabDataUrl, dataUrlToLlmImage } from '../screenshot';
import { getActiveTabId } from '../tabs';
import { runAgent } from './agent-runner';
import {
  extractFactsForTask,
  formatMemoriesForPrompt,
  memoryEntriesFromFacts,
  selectRelevantMemories,
} from './memory';
import { captureFinalSnapshot, captureTaskSnapshot } from './task-snapshot';
import { verifyTask } from './verification';

const VERIFICATION_TIMEOUT_MS = 60_000;
const MEMORY_TIMEOUT_MS = 30_000;

interface PreparedRun {
  tabId: number;
  settings: Settings;
  before: TaskSnapshot;
  vault: string | undefined;
  memories: string | undefined;
}

function visionAvailable(settings: Settings): boolean {
  const config = settings.providers[settings.activeProvider];
  return config.models.vision.trim().length > 0;
}

async function captureScreenshotSafely(): Promise<string | undefined> {
  try {
    return await captureCompressedTabDataUrl();
  } catch {
    return undefined;
  }
}

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
        void this.start(command.goal, command.research);
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

  private async start(goal: string, research?: ResearchActionContext): Promise<void> {
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

    const startedAt = Date.now();
    let prepared: PreparedRun | null = null;
    let result: AgentResult;

    try {
      prepared = await this.prepare(trimmed);
      result = await runAgent({
        goal: trimmed,
        tabId: prepared.tabId,
        limits: prepared.settings.limits,
        features: prepared.settings.features,
        signal: this.controller.signal,
        isPaused: () => this.paused,
        emit: (event) => this.emit(event),
        researchContext: research ? formatActionContext(research) : undefined,
        memories: prepared.memories,
        vault: prepared.vault,
      });
    } catch (error) {
      result = this.toResult(error);
    } finally {
      this.running = false;
    }

    this.report(result);

    if (prepared) {
      await this.runVerificationPass(trimmed, result, prepared, startedAt);
      await this.commitMemoriesFor(trimmed, result, prepared);
    }

    this.controller = null;
  }

  private async commitMemoriesFor(
    goal: string,
    result: AgentResult,
    prepared: PreparedRun,
  ): Promise<void> {
    if (!prepared.settings.features.memory) return;
    if (result.steps.length === 0) return;

    try {
      const facts = await extractFactsForTask({
        goal,
        status: result.status,
        summary: result.summary,
        steps: result.steps,
        signal: AbortSignal.timeout(MEMORY_TIMEOUT_MS),
      });
      if (facts.length === 0) return;
      await appendMemories(memoryEntriesFromFacts(facts, goal));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save anything to memory.';
      this.emit({ type: 'log', level: 'info', message: `Skipped memory update: ${message}` });
    }
  }

  private async prepare(goal: string): Promise<PreparedRun> {
    const settings = await loadSettings();
    const tabId = await getActiveTabId();
    const before = await captureTaskSnapshot(tabId);
    const vault = matchesFormKeywords(goal)
      ? formatVaultForPrompt(await loadVault()) || undefined
      : undefined;
    const memories = await this.recallMemories(goal, settings);
    return { tabId, settings, before, vault, memories };
  }

  private async recallMemories(goal: string, settings: Settings): Promise<string | undefined> {
    if (!settings.features.memory) return undefined;
    try {
      const relevant = selectRelevantMemories(goal, await listMemories());
      const formatted = formatMemoriesForPrompt(relevant);
      return formatted || undefined;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not read past memories.';
      this.emit({ type: 'log', level: 'info', message: `Skipped memory recall: ${message}` });
      return undefined;
    }
  }

  private async runVerificationPass(
    goal: string,
    result: AgentResult,
    prepared: PreparedRun,
    startedAt: number,
  ): Promise<void> {
    const after = await captureFinalSnapshot(prepared.tabId, prepared.before);
    const screenshotDataUrl = await captureScreenshotSafely();
    // Verification runs after the agent loop finishes, so the run's own signal
    // is already aborted when the user stops. Use a fresh deadline-only signal.
    const verifySignal = AbortSignal.timeout(VERIFICATION_TIMEOUT_MS);

    let verification: TaskVerification | null = null;
    try {
      verification = await verifyTask({
        goal,
        status: result.status,
        summary: result.summary,
        before: prepared.before,
        after,
        screenshot: screenshotDataUrl ? dataUrlToLlmImage(screenshotDataUrl) : undefined,
        visionConfigured: visionAvailable(prepared.settings),
        signal: verifySignal,
      });
      this.emit({ type: 'verification', verification });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed.';
      this.emit({ type: 'log', level: 'info', message: `Skipped verification: ${message}` });
    }

    const entry: TaskHistoryEntry = {
      id: crypto.randomUUID(),
      goal,
      status: result.status,
      summary: result.summary,
      startedAt,
      completedAt: Date.now(),
      before: prepared.before,
      after,
      steps: result.steps,
      verification,
      screenshotDataUrl,
    };

    try {
      await saveTaskHistoryEntry(entry);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save this task to history.';
      this.emit({ type: 'log', level: 'error', message });
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
