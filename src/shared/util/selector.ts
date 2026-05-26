/**
 * Builds a stable-ish CSS selector for an element. Strategy: prefer an id when
 * present, otherwise walk up the tree adding nth-of-type segments until we hit
 * an ancestor we can anchor on (an id or the body element). The selector is
 * stable across page loads when ids are present and tolerates moderate DOM
 * shuffling when they aren't.
 */
export function buildSelector(element: Element): string {
  if (element.id) return `#${CSS.escape(element.id)}`;

  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body) {
    const segment = describe(current);
    if (current.id) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      return parts.join(' > ');
    }
    parts.unshift(segment);
    current = current.parentElement;
  }

  parts.unshift('body');
  return parts.join(' > ');
}

function describe(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const parent = element.parentElement;
  if (!parent) return tag;

  const siblings = Array.from(parent.children).filter((child) => child.tagName === element.tagName);
  if (siblings.length === 1) return tag;

  const index = siblings.indexOf(element) + 1;
  return `${tag}:nth-of-type(${index})`;
}
