import type * as vscode from "vscode";

/**
 * Waits for an event to fire, with an optional timeout.
 * This is more reliable than using fixed delays in tests.
 *
 * @param event The event to wait for
 * @param timeoutMs Maximum time to wait (default: 2000ms)
 * @param predicate Optional predicate to filter which events to accept
 * @returns A promise that resolves when the event fires (and predicate passes, if provided)
 */
export async function waitForEvent<T>(
  event: vscode.Event<T>,
  timeoutMs = 2000,
  predicate?: (value: T) => boolean
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      disposable.dispose();
      reject(new Error(`Timed out waiting for event after ${timeoutMs}ms`));
    }, timeoutMs);

    const disposable = event((value) => {
      if (!predicate || predicate(value)) {
        clearTimeout(timeout);
        disposable.dispose();
        resolve(value);
      }
    });
  });
}

/**
 * Waits for a void event to fire, with an optional timeout.
 * Convenience wrapper for events that don't pass a value.
 *
 * @param event The event to wait for
 * @param timeoutMs Maximum time to wait (default: 2000ms)
 */
export async function waitForVoidEvent(
  event: vscode.Event<void>,
  timeoutMs = 2000
): Promise<void> {
  await waitForEvent(event, timeoutMs);
}

/**
 * Creates a promise that resolves after a specified delay.
 * Use this sparingly - prefer event-based synchronization when possible.
 *
 * @param ms Delay in milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits for a condition to become true, polling at a specified interval.
 *
 * @param condition Function that returns true when the condition is met
 * @param timeoutMs Maximum time to wait (default: 2000ms)
 * @param pollIntervalMs How often to check the condition (default: 50ms)
 */
export async function waitForCondition(
  condition: () => boolean,
  timeoutMs = 2000,
  pollIntervalMs = 50
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Timed out waiting for condition after ${timeoutMs}ms`);
    }
    await delay(pollIntervalMs);
  }
}
