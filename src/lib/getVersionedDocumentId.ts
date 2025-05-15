import * as vscode from "vscode";

export function isCurrentActiveVersionedDocumentId(
  versionedDocumentId: string | undefined
): boolean {
  const currentActiveDocumentId = getCurrentActiveVersionedDocumentId();
  return currentActiveDocumentId === versionedDocumentId;
}

export function getCurrentActiveVersionedDocumentId(): string | undefined {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor) {
    return undefined;
  }
  return getVersionedDocumentId(activeTextEditor.document);
}

export function getVersionedDocumentId(document: vscode.TextDocument): string {
  return `${getDocumentId(document)}@${document.version}`;
}

export function getDocumentId(document: vscode.TextDocument): string {
  return getDocumentIdFromUri(document.uri);
}

export function getDocumentIdFromUri(uri: vscode.Uri): string {
  return uri.toString();
}
