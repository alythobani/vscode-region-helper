import * as vscode from "vscode";

export function isCurrentActiveVersionedDocumentId(
  versionedDocumentId: string | undefined
): boolean {
  const currentActiveDocumentId = getCurrentActiveVersionedDocumentId();
  return currentActiveDocumentId === versionedDocumentId;
}

function getCurrentActiveVersionedDocumentId(): string | undefined {
  const activeTextEditor = vscode.window.activeTextEditor;
  if (!activeTextEditor) {
    return undefined;
  }
  return getVersionedDocumentId(activeTextEditor.document);
}

export function getVersionedDocumentId(document: vscode.TextDocument): string {
  return `${document.uri.toString()}@${document.version}`;
}
