export function getTimeoutId(timeout: NodeJS.Timeout): number {
  return timeout[Symbol.toPrimitive]();
}
