import * as vscode from "vscode";
import { toKebabCase } from "./stringUtils";

/**
 * List of valid theme icon ids. Manually copied on 2025-03-07 from the VSCode API icon doc:
 * https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
 */
const validSymbolThemeIconIds = new Set([
  "symbol-array",
  "symbol-boolean",
  "symbol-class",
  "symbol-color",
  "symbol-constant",
  "symbol-constructor",
  "symbol-enum",
  "symbol-enum-member",
  "symbol-event",
  "symbol-field",
  "symbol-file",
  "symbol-folder",
  "symbol-function",
  "symbol-interface",
  "symbol-key",
  "symbol-keyword",
  "symbol-method",
  "symbol-misc",
  "symbol-module",
  "symbol-namespace",
  "symbol-null",
  "symbol-number",
  "symbol-numeric",
  "symbol-object",
  "symbol-operator",
  "symbol-package",
  "symbol-parameter",
  "symbol-property",
  "symbol-reference",
  "symbol-ruler",
  "symbol-snippet",
  "symbol-string",
  "symbol-struct",
  "symbol-structure",
  "symbol-text",
  "symbol-type-parameter",
  "symbol-unit",
  "symbol-value",
  "symbol-variable",
]);

export function getSymbolThemeIcon(symbolKind: vscode.SymbolKind): vscode.ThemeIcon | undefined {
  const symbolThemeIconId = getSymbolThemeIconId(symbolKind);
  if (!validSymbolThemeIconIds.has(symbolThemeIconId)) {
    // console.warn(
    //   `Couldn't find a valid theme icon for symbol kind '${vscode.SymbolKind[symbolKind]}'`
    // );
    return undefined;
  }
  return new vscode.ThemeIcon(symbolThemeIconId);
}

function getSymbolThemeIconId(symbolKind: vscode.SymbolKind): string {
  const pascalCaseSymbolKindName = vscode.SymbolKind[symbolKind];
  const kebabCaseSymbolKindName = toKebabCase(pascalCaseSymbolKindName);
  return `symbol-${kebabCaseSymbolKindName}`;
}
