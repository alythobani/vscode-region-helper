/**
 * A debounced function with cancellation support.
 */
export type DebouncedFunction<T extends (...args: never[]) => void> = {
  (...args: Parameters<T>): void;
  /** Cancels any pending debounced invocation. */
  cancel(): void;
};

/**
 * Creates a debounced version of a function that delays invocation until after
 * `delay` milliseconds have elapsed since the last invocation.
 *
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced function with a `cancel()` method for cleanup
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | undefined;

  const debouncedFn = (...args: Parameters<T>): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      func(...args);
    }, delay);
  };

  debouncedFn.cancel = (): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debouncedFn;
}
