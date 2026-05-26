import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { type ResearchReport } from '@/shared/types/research';

const MAX_STORED_REPORTS = 50;

export async function listReports(): Promise<ResearchReport[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.researchReports);
  const reports = stored[STORAGE_KEYS.researchReports] as ResearchReport[] | undefined;
  return reports ?? [];
}

export async function saveReport(report: ResearchReport): Promise<void> {
  const existing = await listReports();
  const next = [report, ...existing.filter((entry) => entry.id !== report.id)].slice(
    0,
    MAX_STORED_REPORTS,
  );
  await chrome.storage.local.set({ [STORAGE_KEYS.researchReports]: next });
}

export async function deleteReport(id: string): Promise<void> {
  const existing = await listReports();
  const next = existing.filter((entry) => entry.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEYS.researchReports]: next });
}
