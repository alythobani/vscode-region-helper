import * as vscode from "vscode";

export async function fetchDocumentSymbolsAfterDelay(
  document: vscode.TextDocument,
  delayMs: number
): Promise<vscode.DocumentSymbol[] | undefined> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return await fetchDocumentSymbols(document);
}

export async function fetchDocumentSymbols(
  document: vscode.TextDocument
): Promise<vscode.DocumentSymbol[] | undefined> {
  return await vscode.commands.executeCommand<vscode.DocumentSymbol[] | undefined>(
    "vscode.executeDocumentSymbolProvider",
    document.uri
  );
}
