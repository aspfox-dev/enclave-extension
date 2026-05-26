import { type PageContext } from '@/shared/types/chat';
import { type InteractiveElement, type InteractiveKind, type PageSnapshot } from '@/shared/types/dom';
import { hashString } from '@/shared/util/hash';

const INTERACTIVE_SELECTOR =
  'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [contenteditable="true"]';
const MAX_LABEL_LENGTH = 120;
const MAX_PAGE_TEXT = 12_000;

let registry: HTMLElement[] = [];

function isVisible(element: HTMLElement): boolean {
  const { width, height } = element.getBoundingClientRect();
  if (width === 0 || height === 0) return false;

  const style = getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
}

function isDisabled(element: HTMLElement): boolean {
  if (
    element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.disabled;
  }
  return false;
}

function classifyKind(element: HTMLElement): InteractiveKind {
  const tag = element.tagName.toLowerCase();
  if (tag === 'a' || element.getAttribute('role') === 'link') return 'link';
  if (tag === 'select') return 'select';
  if (tag === 'textarea') return 'textarea';
  if (tag === 'input') {
    const { type } = element as HTMLInputElement;
    return type === 'button' || type === 'submit' || type === 'reset' ? 'button' : 'input';
  }
  return 'button';
}

function describe(element: HTMLElement, ref: number): InteractiveElement {
  const rect = element.getBoundingClientRect();
  const value = (element as HTMLInputElement).value;
  return {
    ref,
    kind: classifyKind(element),
    tag: element.tagName.toLowerCase(),
    text: (element.innerText ?? '').trim().slice(0, MAX_LABEL_LENGTH),
    ariaLabel: element.getAttribute('aria-label') ?? '',
    placeholder: element.getAttribute('placeholder') ?? '',
    value: typeof value === 'string' ? value.slice(0, MAX_LABEL_LENGTH) : '',
    box: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
  };
}

export function extractSnapshot(): PageSnapshot {
  const found = Array.from(document.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR)).filter(
    (element) => isVisible(element) && !isDisabled(element),
  );
  registry = found;

  const elements = found.map(describe);
  const signature = elements
    .map((element) => `${element.kind}:${element.text || element.ariaLabel || element.placeholder}`)
    .join('|');

  return {
    url: location.href,
    title: document.title,
    text: (document.body?.innerText ?? '').trim().slice(0, MAX_PAGE_TEXT),
    elements,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
    },
    stateHash: hashString(`${location.href}\n${signature}`),
  };
}

export function extractPageText(): PageContext {
  return {
    url: location.href,
    title: document.title,
    text: (document.body?.innerText ?? '').trim().slice(0, MAX_PAGE_TEXT),
  };
}

const MAX_SERP_URLS = 10;
// Google SERP organic anchors wrap an <h3>; ads and inline carousels don't.
const SERP_RESULT_SELECTOR = 'a:has(h3)';

export function extractSerpUrls(): string[] {
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>(SERP_RESULT_SELECTOR));
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const anchor of anchors) {
    const href = anchor.href;
    if (!href.startsWith('http')) continue;
    if (/^https?:\/\/[^/]*google\.[^/]+\//i.test(href)) continue;
    if (seen.has(href)) continue;

    seen.add(href);
    urls.push(href);
    if (urls.length >= MAX_SERP_URLS) break;
  }
  return urls;
}

export function resolveRef(ref: number): HTMLElement | undefined {
  return registry[ref];
}
