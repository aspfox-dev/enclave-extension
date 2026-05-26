import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { decryptString, encryptString } from '@/shared/crypto/vault-crypto';
import { type Vault } from '@/shared/types/vault';

export function defaultVault(): Vault {
  return {
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    customFields: [],
  };
}

export async function loadVault(): Promise<Vault> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.vault);
  const payload = stored[STORAGE_KEYS.vault] as string | undefined;
  if (!payload) return defaultVault();

  try {
    const json = await decryptString(payload);
    return { ...defaultVault(), ...(JSON.parse(json) as Partial<Vault>) };
  } catch (error) {
    console.warn('Enclave: the vault payload could not be decrypted; falling back to empty.', error);
    return defaultVault();
  }
}

export async function saveVault(vault: Vault): Promise<void> {
  const payload = await encryptString(JSON.stringify(vault));
  await chrome.storage.local.set({ [STORAGE_KEYS.vault]: payload });
}
