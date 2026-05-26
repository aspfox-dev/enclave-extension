import { type WorkflowStep } from '@/shared/types/workflow';

import { sendToContent } from '../tabs';

// Page navigations triggered by a recorded click would otherwise be recorded
// twice — once as the click, once as the resulting navigate. This window skips
// the navigate when it lands right after a click.
const POST_CLICK_NAV_WINDOW_MS = 600;

type TabUpdateListener = (
  tabId: number,
  info: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab,
) => void;

export class WorkflowRecorder {
  private tabId: number | null = null;
  private steps: WorkflowStep[] = [];
  private currentUrl = '';
  private lastClickAt = 0;
  private tabListener: TabUpdateListener | null = null;

  async start(): Promise<void> {
    if (this.tabId !== null) return;

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab?.id || !tab.url) throw new Error('Could not find an active tab to record on.');

    this.tabId = tab.id;
    this.currentUrl = tab.url;
    this.steps = [{ kind: 'navigate', url: tab.url }];
    await this.toggleContentRecording(true);
    this.attachTabListener();
  }

  async stop(): Promise<WorkflowStep[]> {
    if (this.tabId === null) return [];

    await this.toggleContentRecording(false);
    this.detachTabListener();
    const steps = this.steps;
    this.tabId = null;
    this.steps = [];
    this.currentUrl = '';
    this.lastClickAt = 0;
    return steps;
  }

  handleStep(step: WorkflowStep, fromTabId: number | undefined): void {
    if (this.tabId === null || fromTabId !== this.tabId) return;
    if (step.kind === 'click') this.lastClickAt = Date.now();
    this.steps.push(step);
  }

  isActive(): boolean {
    return this.tabId !== null;
  }

  snapshotSteps(): WorkflowStep[] {
    return this.steps.slice();
  }

  private async toggleContentRecording(enable: boolean): Promise<void> {
    if (this.tabId === null) return;
    try {
      await sendToContent(this.tabId, { type: enable ? 'enableRecording' : 'disableRecording' });
    } catch {
      // The content script may not have loaded yet; the tab-update listener
      // re-enables once the next navigation reports status === 'complete'.
    }
  }

  private attachTabListener(): void {
    const listener: TabUpdateListener = (tabId, info) => {
      if (tabId !== this.tabId) return;

      if (info.url && info.url !== this.currentUrl) {
        const sinceClick = Date.now() - this.lastClickAt;
        if (sinceClick >= POST_CLICK_NAV_WINDOW_MS) {
          this.steps.push({ kind: 'navigate', url: info.url });
        }
        this.currentUrl = info.url;
      }

      if (info.status === 'complete') void this.toggleContentRecording(true);
    };

    this.tabListener = listener;
    chrome.tabs.onUpdated.addListener(listener);
  }

  private detachTabListener(): void {
    if (this.tabListener) chrome.tabs.onUpdated.removeListener(this.tabListener);
    this.tabListener = null;
  }
}
