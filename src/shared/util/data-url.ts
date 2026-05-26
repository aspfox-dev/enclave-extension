import { bytesToBase64 } from './base64';

export function htmlToDataUrl(html: string): string {
  const bytes = new TextEncoder().encode(html);
  return `data:text/html;base64,${bytesToBase64(bytes)}`;
}
