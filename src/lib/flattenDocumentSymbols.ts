import type * as vscode from "vscode";

export function flattenDocumentSymbols(
  documentSymbols: vscode.DocumentSymbol[]
): vscode.DocumentSymbol[] {
  return documentSymbols.flatMap((symbol) => [symbol, ...flattenDocumentSymbols(symbol.children)]);
}
