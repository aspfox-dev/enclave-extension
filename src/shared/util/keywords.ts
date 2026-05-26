import { type Vault } from '@/shared/types/vault';

const FORM_KEYWORD_PATTERN =
  /\b(fill|form|register|sign\s?up|apply|checkout|book(?:ing)?|enrol{1,2}|subscribe|signup)\b/i;

export function matchesFormKeywords(goal: string): boolean {
  return FORM_KEYWORD_PATTERN.test(goal);
}

export function formatVaultForPrompt(vault: Vault): string {
  const lines: string[] = [];
  if (vault.name) lines.push(`Name: ${vault.name}`);
  if (vault.email) lines.push(`Email: ${vault.email}`);
  if (vault.phone) lines.push(`Phone: ${vault.phone}`);
  if (vault.address) lines.push(`Address: ${vault.address}`);
  if (vault.dateOfBirth) lines.push(`Date of birth: ${vault.dateOfBirth}`);
  for (const { label, value } of vault.customFields) {
    if (label && value) lines.push(`${label}: ${value}`);
  }
  return lines.join('\n');
}
