export function assertExists<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(message ?? `Expected value to exist, but got ${value}`);
  }
}
