import {
  COMMUNITY_CACHE_TTL_MS,
  COMMUNITY_FETCH_TIMEOUT_MS,
  COMMUNITY_HUB_URL,
} from '@/shared/constants/community';
import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { type CommunityCache, type CommunityWorkflow } from '@/shared/types/community';
import { type WorkflowStep } from '@/shared/types/workflow';

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function parseStep(value: unknown): WorkflowStep | null {
  if (!value || typeof value !== 'object') return null;
  const { kind } = value as { kind?: unknown };
  switch (kind) {
    case 'navigate': {
      const url = asString((value as { url?: unknown }).url);
      return url ? { kind: 'navigate', url } : null;
    }
    case 'click': {
      const { selector: selectorRaw, label: labelRaw } = value as Record<string, unknown>;
      const selector = asString(selectorRaw);
      const label = asString(labelRaw);
      return selector ? { kind: 'click', selector, label } : null;
    }
    case 'type': {
      const { selector: selectorRaw, text: textRaw, submit: submitRaw } = value as Record<string, unknown>;
      const selector = asString(selectorRaw);
      return selector
        ? { kind: 'type', selector, text: asString(textRaw), submit: asBoolean(submitRaw) }
        : null;
    }
    default:
      return null;
  }
}

function parseWorkflow(value: unknown): CommunityWorkflow | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const name = asString(record.name);
  if (!name) return null;

  const rawSteps = Array.isArray(record.steps) ? record.steps : [];
  const steps = rawSteps.map(parseStep).filter((step): step is WorkflowStep => step !== null);
  if (steps.length === 0) return null;

  return {
    name,
    description: asString(record.description),
    version: asString(record.version) || '1.0',
    author: asString(record.author) || 'community',
    steps,
  };
}

function parseWorkflowList(value: unknown): CommunityWorkflow[] {
  if (!Array.isArray(value)) {
    throw new Error('The community hub did not return a list of workflows.');
  }
  return value
    .map(parseWorkflow)
    .filter((workflow): workflow is CommunityWorkflow => workflow !== null);
}

export async function loadCommunityCache(): Promise<CommunityCache | null> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.communityHubCache);
  return (stored[STORAGE_KEYS.communityHubCache] as CommunityCache | undefined) ?? null;
}

async function saveCommunityCache(cache: CommunityCache): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.communityHubCache]: cache });
}

export function isCacheFresh(cache: CommunityCache): boolean {
  return Date.now() - cache.fetchedAt < COMMUNITY_CACHE_TTL_MS;
}

export async function fetchCommunityWorkflows(): Promise<CommunityCache> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COMMUNITY_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(COMMUNITY_HUB_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`The community hub responded with status ${response.status}.`);
    }
    const workflows = parseWorkflowList(await response.json());
    const cache: CommunityCache = { workflows, fetchedAt: Date.now() };
    await saveCommunityCache(cache);
    return cache;
  } finally {
    clearTimeout(timer);
  }
}
