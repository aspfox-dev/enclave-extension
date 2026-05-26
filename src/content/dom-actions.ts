import { type ScrollDirection } from '@/shared/types/agent';
import { type ContentActionResult } from '@/shared/types/messaging';

import { resolveRef } from './dom-extractor';

const SCROLL_FRACTION = 0.8;
const MAX_TARGET_LABEL = 60;

type EditableElement = HTMLInputElement | HTMLTextAreaElement;

function describeTarget(element: HTMLElement): string {
  const label =
    element.getAttribute('aria-label') ||
    element.innerText ||
    (element as HTMLInputElement).placeholder ||
    element.tagName.toLowerCase();
  return label.trim().slice(0, MAX_TARGET_LABEL) || element.tagName.toLowerCase();
}

/**
 * Writes through the prototype setter so React's value tracker registers the
 * change; assigning element.value directly is silently reverted on controlled
 * inputs.
 */
function applyValue(element: EditableElement, text: string): void {
  const prototype =
    element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  setter?.call(element, text);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function dispatchEnter(element: HTMLElement): void {
  const init: KeyboardEventInit = { key: 'Enter', code: 'Enter', bubbles: true };
  element.dispatchEvent(new KeyboardEvent('keydown', init));
  element.dispatchEvent(new KeyboardEvent('keyup', init));
}

function performClick(element: HTMLElement): ContentActionResult {
  element.scrollIntoView({ block: 'center', behavior: 'auto' });
  element.click();
  return { ok: true, detail: `Clicked "${describeTarget(element)}"` };
}

function performType(element: HTMLElement, text: string, submit: boolean): ContentActionResult {
  const isEditable =
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element.isContentEditable;
  if (!isEditable) {
    return { ok: false, detail: `Target "${describeTarget(element)}" cannot accept typed text.` };
  }

  element.focus();
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    applyValue(element, text);
    if (submit && element.form) {
      element.form.requestSubmit();
      return { ok: true, detail: `Typed into "${describeTarget(element)}" and submitted` };
    }
  } else {
    element.textContent = text;
    element.dispatchEvent(new InputEvent('input', { bubbles: true }));
  }

  if (submit) dispatchEnter(element);
  return { ok: true, detail: `Typed into "${describeTarget(element)}"${submit ? ' and submitted' : ''}` };
}

function missingRef(ref: number): ContentActionResult {
  return {
    ok: false,
    detail: `No interactive element is registered at ref ${ref}. The page must be re-extracted first.`,
  };
}

function missingSelector(selector: string): ContentActionResult {
  return { ok: false, detail: `No element on this page matches the selector "${selector}".` };
}

export function clickRef(ref: number): ContentActionResult {
  const element = resolveRef(ref);
  return element ? performClick(element) : missingRef(ref);
}

export function typeIntoRef(ref: number, text: string, submit: boolean): ContentActionResult {
  const element = resolveRef(ref);
  return element ? performType(element, text, submit) : missingRef(ref);
}

export function clickBySelector(selector: string): ContentActionResult {
  const element = document.querySelector<HTMLElement>(selector);
  return element ? performClick(element) : missingSelector(selector);
}

export function typeBySelector(selector: string, text: string, submit: boolean): ContentActionResult {
  const element = document.querySelector<HTMLElement>(selector);
  return element ? performType(element, text, submit) : missingSelector(selector);
}

export function scrollPage(direction: ScrollDirection): ContentActionResult {
  const amount = window.innerHeight * SCROLL_FRACTION;
  window.scrollBy({ top: direction === 'down' ? amount : -amount, behavior: 'auto' });
  return { ok: true, detail: `Scrolled ${direction}` };
}
