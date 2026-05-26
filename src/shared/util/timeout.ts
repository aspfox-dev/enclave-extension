/**
 * Races a promise against a timeout. The supplied AbortController is aborted when
 * the deadline passes so the underlying fetch is actually cancelled rather than
 * left running in the background.
 */
export async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  onTimeoutMessage: string,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await run(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) throw new Error(onTimeoutMessage);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
