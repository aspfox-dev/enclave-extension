import { STORAGE_KEYS } from '@/shared/constants/storage-keys';
import { base64ToBytes, bytesToBase64 } from '@/shared/util/base64';

// "Encrypted at rest" in the free tier means AES-GCM with a key generated once
// and held in chrome.storage.local alongside the ciphertext. It defeats casual
// disk inspection and matches the spec's promise; real secrecy comes with the
// paid tier's password-derived key, which lives in cloud sync logic.
const ALGORITHM: AesKeyGenParams = { name: 'AES-GCM', length: 256 };
const IV_BYTES = 12;

async function loadKey(): Promise<CryptoKey> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.vaultKey);
  const jwk = stored[STORAGE_KEYS.vaultKey] as JsonWebKey | undefined;

  if (jwk) {
    return crypto.subtle.importKey('jwk', jwk, ALGORITHM, false, ['encrypt', 'decrypt']);
  }

  const generated = await crypto.subtle.generateKey(ALGORITHM, true, ['encrypt', 'decrypt']);
  const exported = await crypto.subtle.exportKey('jwk', generated);
  await chrome.storage.local.set({ [STORAGE_KEYS.vaultKey]: exported });
  return generated;
}

export async function encryptString(plaintext: string): Promise<string> {
  const key = await loadKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext)),
  );

  const combined = new Uint8Array(iv.length + cipher.length);
  combined.set(iv, 0);
  combined.set(cipher, iv.length);
  return bytesToBase64(combined);
}

export async function decryptString(payload: string): Promise<string> {
  const key = await loadKey();
  const combined = base64ToBytes(payload);
  const iv = combined.slice(0, IV_BYTES);
  const cipher = combined.slice(IV_BYTES);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return new TextDecoder().decode(plain);
}
