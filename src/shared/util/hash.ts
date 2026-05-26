const HASH_PRIME = 31;

export function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * HASH_PRIME + input.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}
