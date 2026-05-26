import {
  type ActionReply,
  type ContentRequest,
  type ExtractReply,
  type PageTextReply,
  type SerpUrlsReply,
} from '@/shared/types/messaging';

import {
  clickBySelector,
  clickRef,
  scrollPage,
  typeBySelector,
  typeIntoRef,
} from './dom-actions';
import { extractPageText, extractSerpUrls, extractSnapshot } from './dom-extractor';
import { disableRecording, enableRecording } from './recorder';

const HANDLED_TYPES = new Set<ContentRequest['type']>([
  'extract',
  'pageText',
  'serpUrls',
  'click',
  'type',
  'scroll',
  'clickSelector',
  'typeSelector',
  'enableRecording',
  'disableRecording',
]);

function handle(request: ContentRequest): ExtractReply | PageTextReply | SerpUrlsReply | ActionReply {
  switch (request.type) {
    case 'extract':
      return { ok: true, data: extractSnapshot() };
    case 'pageText':
      return { ok: true, data: extractPageText() };
    case 'serpUrls':
      return { ok: true, data: extractSerpUrls() };
    case 'click':
      return { ok: true, data: clickRef(request.ref) };
    case 'type':
      return { ok: true, data: typeIntoRef(request.ref, request.text, request.submit) };
    case 'scroll':
      return { ok: true, data: scrollPage(request.direction) };
    case 'clickSelector':
      return { ok: true, data: clickBySelector(request.selector) };
    case 'typeSelector':
      return { ok: true, data: typeBySelector(request.selector, request.text, request.submit) };
    case 'enableRecording':
      enableRecording();
      return { ok: true, data: { ok: true, detail: 'Recording enabled' } };
    case 'disableRecording':
      disableRecording();
      return { ok: true, data: { ok: true, detail: 'Recording disabled' } };
  }
}

chrome.runtime.onMessage.addListener((message: ContentRequest, _sender, sendResponse) => {
  if (!message || !HANDLED_TYPES.has(message.type)) return false;

  try {
    sendResponse(handle(message));
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'The content script hit an unexpected error.';
    sendResponse({ ok: false, error: detail });
  }
  return false;
});
