import * as vscode from "vscode";
import { getVersionedDocumentId } from "./getVersionedDocumentId";

type DocumentSymbolFetchResult = {
  documentSymbols: vscode.DocumentSymbol[] | undefined;
  versionedDocumentId: string;
};

export async function fetchDocumentSymbolsAfterDelay(
  document: vscode.TextDocument,
  delayMs: number
): Promise<DocumentSymbolFetchResult> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return await fetchDocumentSymbols(document);
}

export async function fetchDocumentSymbols(
  document: vscode.TextDocument
): Promise<DocumentSymbolFetchResult> {
  // Track the document version as of when the document symbols are fetched.
  const versionedDocumentId = getVersionedDocumentId(document);
  const fetchedDocumentSymbols = await vscode.commands.executeCommand<
    vscode.DocumentSymbol[] | undefined
  >("vscode.executeDocumentSymbolProvider", document.uri);
  return { documentSymbols: fetchedDocumentSymbols, versionedDocumentId };
}
