const CDP_VERSION = '1.3';
const ENTER_KEY_CODE = 13;

export class CdpInputController {
  private attached = false;

  constructor(private readonly tabId: number) {}

  async attach(): Promise<void> {
    if (this.attached) return;
    await chrome.debugger.attach({ tabId: this.tabId }, CDP_VERSION);
    this.attached = true;
  }

  async click(imageX: number, imageY: number, pixelRatio: number): Promise<void> {
    await this.attach();
    const x = Math.round(imageX / pixelRatio);
    const y = Math.round(imageY / pixelRatio);
    const base = { x, y, button: 'left', clickCount: 1 } as const;

    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...base });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...base });
  }

  async typeText(text: string, submit: boolean): Promise<void> {
    await this.attach();
    if (text) await this.send('Input.insertText', { text });
    if (!submit) return;

    const enter = { code: 'Enter', key: 'Enter', windowsVirtualKeyCode: ENTER_KEY_CODE } as const;
    await this.send('Input.dispatchKeyEvent', { type: 'keyDown', ...enter });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', ...enter });
  }

  async detach(): Promise<void> {
    if (!this.attached) return;
    try {
      await chrome.debugger.detach({ tabId: this.tabId });
    } finally {
      this.attached = false;
    }
  }

  private send(method: string, params: Record<string, unknown>): Promise<unknown> {
    return chrome.debugger.sendCommand({ tabId: this.tabId }, method, params);
  }
}
