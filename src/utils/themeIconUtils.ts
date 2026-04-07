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

/**
 * Mapping from theme icon ID to theme color ID. Shouldn't be necessary, but is necessary due to a
 * VSCode bug still open as of 2026-04-06: https://github.com/microsoft/vscode/issues/299479
 *
 * Ideally the above bug gets fixed and we can remove this manual mapping.
 *
 * Symbol icon color ID reference:
 * https://code.visualstudio.com/api/references/theme-color#symbol-icons-colors
 */
const iconColorIdBySymbolThemeIconId: Record<string, string | undefined> = {
  "symbol-array": "symbolIcon.arrayForeground",
  "symbol-boolean": "symbolIcon.booleanForeground",
  "symbol-class": "symbolIcon.classForeground",
  "symbol-color": "symbolIcon.colorForeground",
  "symbol-constant": "symbolIcon.constantForeground",
  "symbol-constructor": "symbolIcon.constructorForeground",
  "symbol-enum": "symbolIcon.enumeratorForeground",
  "symbol-enum-member": "symbolIcon.enumeratorMemberForeground",
  "symbol-event": "symbolIcon.eventForeground",
  "symbol-field": "symbolIcon.fieldForeground",
  "symbol-file": "symbolIcon.fileForeground",
  "symbol-folder": "symbolIcon.folderForeground",
  "symbol-function": "symbolIcon.functionForeground",
  "symbol-interface": "symbolIcon.interfaceForeground",
  "symbol-key": "symbolIcon.keyForeground",
  "symbol-keyword": "symbolIcon.keywordForeground",
  "symbol-method": "symbolIcon.methodForeground",
  "symbol-misc": undefined, // No matching theme color
  "symbol-module": "symbolIcon.moduleForeground",
  "symbol-namespace": "symbolIcon.namespaceForeground",
  "symbol-null": "symbolIcon.nullForeground",
  "symbol-number": "symbolIcon.numberForeground",
  "symbol-numeric": undefined, // No matching theme color
  "symbol-object": "symbolIcon.objectForeground",
  "symbol-operator": "symbolIcon.operatorForeground",
  "symbol-package": "symbolIcon.packageForeground",
  "symbol-parameter": undefined,
  "symbol-property": "symbolIcon.propertyForeground",
  "symbol-reference": "symbolIcon.referenceForeground",
  "symbol-ruler": undefined, // No matching theme color
  "symbol-snippet": "symbolIcon.snippetForeground",
  "symbol-string": "symbolIcon.stringForeground",
  "symbol-struct": "symbolIcon.structForeground",
  "symbol-structure": undefined, // No matching theme color
  "symbol-text": "symbolIcon.textForeground",
  "symbol-type-parameter": "symbolIcon.typeParameterForeground",
  "symbol-unit": "symbolIcon.unitForeground",
  "symbol-value": undefined, // No matching theme color
  "symbol-variable": "symbolIcon.variableForeground",
};

export function getSymbolThemeIcon(symbolThemeIconId: string): vscode.ThemeIcon | undefined {
  if (!validSymbolThemeIconIds.has(symbolThemeIconId)) {
    // console.warn(
    //   `Couldn't find a valid theme icon for symbol kind '${vscode.SymbolKind[symbolKind]}'`
    // );
    return undefined;
  }
  const iconColorId = iconColorIdBySymbolThemeIconId[symbolThemeIconId];
  return new vscode.ThemeIcon(
    symbolThemeIconId,
    iconColorId !== undefined ? new vscode.ThemeColor(iconColorId) : undefined
  );
}

/**
 * Converts a SymbolKind enum value to a kebab-case string that can be used as a valid theme icon
 * ID. For example, `SymbolKind.TypeParameter` becomes "symbol-type-parameter".
 */
export function getSymbolThemeIconId(symbolKind: vscode.SymbolKind): string {
  const pascalCaseSymbolKindName = vscode.SymbolKind[symbolKind];
  const kebabCaseSymbolKindName = toKebabCase(pascalCaseSymbolKindName);
  return `symbol-${kebabCaseSymbolKindName}`;
}
