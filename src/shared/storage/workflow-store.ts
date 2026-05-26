import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { type Workflow } from '@/shared/types/workflow';

export async function listWorkflows(): Promise<Workflow[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.workflows);
  const workflows = stored[STORAGE_KEYS.workflows] as Workflow[] | undefined;
  return workflows ?? [];
}

export async function saveWorkflow(workflow: Workflow): Promise<void> {
  const existing = await listWorkflows();
  const next = [workflow, ...existing.filter((entry) => entry.id !== workflow.id)];
  await chrome.storage.local.set({ [STORAGE_KEYS.workflows]: next });
}

export async function deleteWorkflow(id: string): Promise<void> {
  const existing = await listWorkflows();
  const next = existing.filter((entry) => entry.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEYS.workflows]: next });
}

export async function getWorkflow(id: string): Promise<Workflow | undefined> {
  const all = await listWorkflows();
  return all.find((workflow) => workflow.id === id);
}
