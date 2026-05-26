import { type RuntimeRequest } from '@/shared/types/messaging';
import { type WorkflowStep } from '@/shared/types/workflow';
import { buildSelector } from '@/shared/util/selector';

const MAX_LABEL_LENGTH = 60;
let attached = false;

function clickHandler(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const selector = buildSelector(target);
  const label = labelFor(target);
  emit({ kind: 'click', selector, label });
}

function changeHandler(event: Event): void {
  const target = event.target;
  if (
    !(target instanceof HTMLInputElement) &&
    !(target instanceof HTMLTextAreaElement)
  ) {
    return;
  }
  if (target.type === 'password') return;

  const selector = buildSelector(target);
  emit({ kind: 'type', selector, text: target.value, submit: false });
}

function labelFor(element: Element): string {
  const candidate =
    (element instanceof HTMLElement &&
      (element.getAttribute('aria-label') ||
        element.innerText ||
        (element as HTMLInputElement).placeholder)) ||
    element.tagName.toLowerCase();
  return candidate.trim().slice(0, MAX_LABEL_LENGTH);
}

function emit(step: WorkflowStep): void {
  const message: RuntimeRequest = { type: 'workflow:event', step };
  try {
    void chrome.runtime.sendMessage(message);
  } catch {
    // The background worker may have suspended momentarily; recording continues
    // on its next event. Losing one step is the right trade-off versus crashing.
  }
}

export function enableRecording(): void {
  if (attached) return;
  document.addEventListener('click', clickHandler, true);
  document.addEventListener('change', changeHandler, true);
  attached = true;
}

export function disableRecording(): void {
  if (!attached) return;
  document.removeEventListener('click', clickHandler, true);
  document.removeEventListener('change', changeHandler, true);
  attached = false;
}
