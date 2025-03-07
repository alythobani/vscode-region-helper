export function toKebabCase(pascalCaseStr: string): string {
  return pascalCaseStr.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
