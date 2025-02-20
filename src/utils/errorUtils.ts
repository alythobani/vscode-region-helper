export function throwNever(value: never): never {
  throw new Error("Unexpected value (expected never):", value);
}
